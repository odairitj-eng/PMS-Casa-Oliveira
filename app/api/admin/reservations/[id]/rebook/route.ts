import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { calculateRefundAmount } from "@/lib/cancellation";

/**
 * Endpoint de Rebooking Automático
 * Cria uma nova reserva vinculada a uma original, utilizando créditos disponíveis.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const { id: originalReservationId } = params;
        const body = await req.json();
        const {
            newCheckIn,
            newCheckOut,
            newTotalAmount,
            newNightlyRate,
            newCleaningFee,
            newTotalNights,
            reason
        } = body;

        // 1. Validar reserva original e créditos
        const originalRes = await db.reservation.findUnique({
            where: { id: originalReservationId },
            include: {
                creditsGenerated: {
                    where: { status: "ACTIVE" }
                }
            }
        });

        if (!originalRes) {
            return NextResponse.json({ error: 'Reserva original não encontrada.' }, { status: 404 });
        }

        // Calcular crédito disponível (da reserva original especificamente ou do hóspede)
        const availableCredit = originalRes.creditsGenerated.reduce((sum, c) => sum + c.amountAvailable, 0);

        // 2. Criar Nova Reserva e Vincular
        const result = await db.$transaction(async (tx: any) => {
            // A) Criar a nova reserva
            const newReservation = await tx.reservation.create({
                data: {
                    propertyId: originalRes.propertyId,
                    guestId: originalRes.guestId,
                    checkIn: new Date(newCheckIn),
                    checkOut: new Date(newCheckOut),
                    status: availableCredit >= newTotalAmount ? "CONFIRMED" : "PENDING_PAYMENT",
                    totalAmount: newTotalAmount,
                    nightlyRate: newNightlyRate,
                    cleaningFee: newCleaningFee,
                    totalNights: newTotalNights,
                    rebookedFromId: originalRes.id,
                    numGuests: originalRes.numGuests
                }
            });

            // B) Registrar o Rebooking na tabela de ligação
            const usedFromCredit = Math.min(availableCredit, newTotalAmount);
            const additionalToPay = Math.max(0, newTotalAmount - availableCredit);

            await tx.reservationRebooking.create({
                data: {
                    originalReservationId: originalRes.id,
                    newReservationId: newReservation.id,
                    creditUsedAmount: usedFromCredit,
                    additionalPaymentAmount: additionalToPay,
                    reason: reason,
                    createdBy: (session.user as any).id
                }
            });

            // C) Consumir os créditos utilizados
            let remainingToConsume = usedFromCredit;
            for (const credit of originalRes.creditsGenerated) {
                if (remainingToConsume <= 0) break;
                const amountToUse = Math.min(credit.amountAvailable, remainingToConsume);

                await tx.reservationCredit.update({
                    where: { id: credit.id },
                    data: {
                        amountAvailable: { decrement: amountToUse },
                        amountUsed: { increment: amountToUse },
                        status: credit.amountAvailable - amountToUse <= 0 ? "USED" : "PARTIALLY_USED"
                    }
                });

                remainingToConsume -= amountToUse;
            }

            // D) Se a nova reserva for paga com crédito, criar o pagamento "virtual"
            if (usedFromCredit > 0) {
                await tx.payment.create({
                    data: {
                        reservationId: newReservation.id,
                        method: "CREDIT_BALANCE",
                        status: "APPROVED",
                        amount: usedFromCredit,
                        provider: "SYSTEM_CREDIT",
                        gatewayTransactionId: `CREDIT_FROM_${originalRes.id}`
                    }
                });
            }

            // E) Bloquear datas para a nova reserva
            const days = [];
            let current = new Date(newCheckIn);
            const end = new Date(newCheckOut);
            while (current < end) {
                days.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            for (const day of days) {
                await tx.blockedDate.create({
                    data: {
                        propertyId: originalRes.propertyId,
                        date: day,
                        source: "DIRECT_RESERVATION",
                        reservationId: newReservation.id,
                        reason: `Remarcação da reserva ${originalRes.id}`
                    }
                });
            }

            // F) Eventos
            await tx.reservationEvent.create({
                data: {
                    reservationId: originalRes.id,
                    type: "REBOOKED_TO_NEW",
                    userId: (session.user as any).id,
                    reason: reason,
                    metadata: { newReservationId: newReservation.id, creditApplied: usedFromCredit }
                }
            });

            await tx.reservationEvent.create({
                data: {
                    reservationId: newReservation.id,
                    type: "NEW_RESERVATION_FROM_REBOOK",
                    userId: (session.user as any).id,
                    reason: `Remarcação vinculada à reserva ${originalRes.id}`,
                    metadata: { originalReservationId: originalRes.id, creditApplied: usedFromCredit }
                }
            });

            return newReservation;
        });

        return NextResponse.json({
            success: true,
            reservation: result,
            creditApplied: Math.min(availableCredit, newTotalAmount)
        });

    } catch (error: any) {
        console.error("Rebooking Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
