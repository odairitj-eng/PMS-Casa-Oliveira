export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getDateAvailabilityStatus } from "@/lib/availability";
import { startOfDay, format } from "date-fns";
import { channex } from "@/lib/channex";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const body = await req.json();
        const { propertyId, guestId, checkIn, checkOut, totalAmount, nightlyRate, cleaningFee, totalNights, numGuests, occupants = [] } = body;

        const inDate = startOfDay(new Date(checkIn));
        const outDate = startOfDay(new Date(checkOut));

        const result = await db.$transaction(async (tx: any) => {
            // Advisory lock para evitar double booking simultâneo
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(1001)`;

            // 1. Verificar disponibilidade dia a dia
            let dt = new Date(inDate);
            while (dt < outDate) {
                const status = await getDateAvailabilityStatus(propertyId, dt, tx);
                if (status !== 'OPEN') {
                    throw new Error(`As datas selecionadas não estão disponíveis (${status}).`);
                }
                dt = new Date(dt.setDate(dt.getDate() + 1));
            }

            // 2. Criar Reserva (Status CONFIRMED pois é manual)
            const reservation = await tx.reservation.create({
                data: {
                    propertyId,
                    guestId,
                    checkIn: inDate,
                    checkOut: outDate,
                    status: 'CONFIRMED',
                    totalAmount,
                    nightlyRate,
                    cleaningFee,
                    totalNights,
                    numGuests,
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

            // 3. Bloquear as Datas
            let blockDt = new Date(inDate);
            const datesToBlock = [];
            while (blockDt < outDate) {
                datesToBlock.push({
                    propertyId,
                    date: new Date(blockDt),
                    source: 'ADMIN' as const,
                    reservationId: reservation.id,
                    reason: 'Reserva Manual via CRM'
                });
                blockDt = new Date(blockDt.setDate(blockDt.getDate() + 1));
            }

            await tx.blockedDate.createMany({
                data: datesToBlock
            });

            // 4. Atualizar estatísticas do hóspede
            await tx.guest.update({
                where: { id: guestId },
                data: {
                    totalBookings: { increment: 1 },
                    totalRevenueGenerated: { increment: totalAmount },
                    lastReservationAt: new Date()
                }
            });

            return reservation;
        });

        // Disparo Assíncrono para a Channex (Segundo Plano)
        // Não usamos 'await' aqui para que o Admin receba a resposta do site imediatamente
        channex.pushAvailability(
            propertyId,
            format(inDate, "yyyy-MM-dd"),
            format(outDate, "yyyy-MM-dd")
        ).catch(err => console.error("[Channex Sync Error]:", err));

        return NextResponse.json({
            success: true,
            reservation: result
        }, { status: 201 });

    } catch (error: any) {
        console.error('Manual Reservation Error:', error);
        return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 400 });
    }
}
