import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { createPixPayment } from "@/lib/payments";
import { getDateAvailabilityStatus } from "@/lib/availability";
import { startOfDay, format, differenceInDays } from "date-fns";
import { channex } from "@/lib/channex";
import { reservationSchema } from "@/lib/validations/schemas";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { calculateSmartPrice } from "@/lib/pricing";

export async function POST(req: NextRequest) {
    try {
        const limiter = await rateLimit(req, 10, 60000); // 10 por minuto
        if (!limiter.success) return rateLimitResponse();

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Você precisa estar logado para reservar.' }, { status: 401 });
        }

        const body = await req.json();

        // 🛡️ VALIDAÇÃO DE SCHEMA (ZOD HARDENING)
        const parseResult = reservationSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Dados de reserva inválidos.',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { propertyId, checkIn, checkOut, guestName, guestEmail, guestPhone,
            guests, infants, pets, occupants = [], paymentMethod = "PIX" } = parseResult.data as any;

        if (guestEmail !== session.user.email) {
            return NextResponse.json({ error: 'Identidade do hóspede inválida para esta sessão.' }, { status: 403 });
        }

        const inDate = startOfDay(new Date(checkIn));
        const outDate = startOfDay(new Date(checkOut));

        const result = await db.$transaction(async (tx: any) => {
            // Transaction Lock
            // Usamos 1001 como um identificador numérico constante para a trava (advisory lock)
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(1001)`;

            // 2. Criar/Atualizar Hóspede (CRM)
            const property = await tx.property.findUnique({ where: { id: propertyId } });
            if (!property || !property.isActive) throw new Error("Propriedade indisponível.");

            const pricing = await calculateSmartPrice(propertyId, inDate, outDate, tx);
            const totalNights = pricing.totalNights;
            const totalAmount = pricing.total;
            const cleaningFee = pricing.cleaningFee;
            const nightlyRate = pricing.nightlyRate;

            // 1.5 Validar Lotação e Pets
            if (guests > property.maxGuests) throw new Error(`Máximo de ${property.maxGuests} hóspedes permitido.`);
            if (pets > 0 && !property.allowsPets) throw new Error("Animais não são permitidos nesta propriedade.");
            if (pets > property.maxPets) throw new Error(`Máximo de ${property.maxPets} pets permitido.`);

            // 1.6 Verificar disponibilidade dia a dia
            let dt = new Date(inDate);
            while (dt < outDate) {
                const status = await getDateAvailabilityStatus(propertyId, dt, tx);
                if (status !== 'OPEN') {
                    throw new Error(`As datas selecionadas não estão disponíveis (${status}).`);
                }
                dt = new Date(dt.setDate(dt.getDate() + 1));
            }

            // 2. Criar/Atualizar Hóspede (CRM)
            const guest = await tx.guest.upsert({
                where: { email: guestEmail },
                update: {
                    phone: guestPhone,
                    name: guestName,
                    userId: (session.user as any).id,
                    lastReservationAt: new Date(),
                    totalBookings: { increment: 1 },
                    sourceChannel: 'DIRECT'
                },
                create: {
                    email: guestEmail,
                    phone: guestPhone,
                    name: guestName,
                    userId: (session.user as any).id,
                    lastReservationAt: new Date(),
                    totalBookings: 1,
                    sourceChannel: 'DIRECT'
                },
            });

            // 0. IDEMPOTÊNCIA (Prevenção de duplicidade)
            const existingPending = await tx.reservation.findFirst({
                where: {
                    guestId: guest.id,
                    propertyId,
                    checkIn: inDate,
                    checkOut: outDate,
                    status: 'PENDING_PAYMENT',
                    createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }
                }
            });

            if (existingPending) {
                return existingPending;
            }

            // 3. Criar Reserva (Hold de 30 minutos)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30);

            const reservation = await tx.reservation.create({
                data: {
                    propertyId,
                    guestId: guest.id,
                    checkIn: inDate,
                    checkOut: outDate,
                    status: 'PENDING_PAYMENT',
                    totalAmount,
                    nightlyRate,
                    cleaningFee,
                    totalNights,
                    holdExpiresAt: expiresAt,
                    numGuests: guests,
                    occupants: {
                        createMany: {
                            data: occupants.map((occ: any) => ({
                                name: occ.name,
                                document: occ.document,
                                isChild: !!occ.isChild
                            }))
                        }
                    }
                }
            });

            // 4. Bloquear as Datas
            let blockDt = new Date(inDate);
            const datesToBlock = [];
            while (blockDt < outDate) {
                datesToBlock.push({
                    propertyId,
                    date: new Date(blockDt),
                    source: 'DIRECT_RESERVATION' as const,
                    reservationId: reservation.id
                });
                blockDt = new Date(blockDt.setDate(blockDt.getDate() + 1));
            }

            await tx.blockedDate.createMany({
                data: datesToBlock
            });

            return reservation;
        });

        // Disparo Assíncrono para a Channex (Segundo Plano)
        channex.pushAvailability(
            propertyId,
            format(inDate, "yyyy-MM-dd"),
            format(outDate, "yyyy-MM-dd")
        ).catch(err => console.error("[Channex Sync Error]:", err));

        if (paymentMethod === "PIX") {
            const pixData = await createPixPayment({
                amount: result.totalAmount,
                description: `Reserva Casa Oliveira (${result.totalNights} noites)`,
                email: guestEmail,
                externalId: result.id
            });

            await db.payment.create({
                data: {
                    reservationId: result.id,
                    gatewayTransactionId: pixData.id,
                    method: 'PIX',
                    amount: result.totalAmount,
                    status: 'PENDING'
                }
            });

            return NextResponse.json({
                success: true,
                reservationId: result.id,
                pix: pixData.point_of_interaction.transaction_data
            }, { status: 201 });
        } else {
            // FluxO CARTÃO (Redirecionamento Seguro / Preference)
            const { createCheckoutPreference } = await import("@/lib/payments");
            const preference = await createCheckoutPreference({
                amount: result.totalAmount,
                description: `Reserva Casa Oliveira (${result.totalNights} noites)`,
                email: guestEmail,
                externalId: result.id
            });

            await db.payment.create({
                data: {
                    reservationId: result.id,
                    gatewayTransactionId: preference.id?.toString() || "pending_pref",
                    method: 'CREDIT_CARD',
                    amount: result.totalAmount,
                    status: 'PENDING'
                }
            });

            return NextResponse.json({
                success: true,
                reservationId: result.id,
                checkoutUrl: preference.init_point
            }, { status: 201 });
        }

    } catch (error: any) {
        console.error('[SECURITY RESERVATION ERROR]:', error);
        // Não retornar o erro bruto se não for uma mensagem controlada (Error)
        const isClientError = error instanceof Error && !error.message.includes('Prisma') && !error.message.includes('axios');
        return NextResponse.json({
            error: isClientError ? error.message : 'Não foi possível processar sua reserva no momento. Tente novamente mais tarde.'
        }, { status: 400 });
    }
}
