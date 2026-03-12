export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { refundPayment } from "@/lib/payments";
import { calculateRefundAmount, canReservationBeCancelled, getNewStatusAfterCancellation } from "@/lib/cancellation";
import { channex } from "@/lib/channex";
import { format } from "date-fns";

/**
 * GET: Preview de Cancelamento
 * Retorna os detalhes do reembolso sugerido pela política antes do hóspede confirmar.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const { id } = params;
        const reservation = await db.reservation.findUnique({
            where: { id },
            include: {
                guest: true,
                payments: { where: { status: 'APPROVED' } },
                property: { include: { cancellationPolicy: true } }
            }
        });

        if (!reservation || reservation.guest.email !== session.user.email) {
            return NextResponse.json({ error: 'Reserva não encontrada.' }, { status: 404 });
        }

        const totalPaid = reservation.payments.reduce((sum, p) => sum + p.amount, 0);
        const refundCalc = calculateRefundAmount(reservation.checkIn, totalPaid, reservation.property.cancellationPolicy);

        return NextResponse.json({
            success: true,
            totalPaid,
            refundAmount: refundCalc.refundAmount,
            refundPercentage: refundCalc.refundPercentage,
            policyName: refundCalc.policyApplied,
            canCancel: canReservationBeCancelled(reservation.status)
        });

    } catch (error: any) {
        return NextResponse.json({ error: 'Erro ao processar preview de cancelamento.' }, { status: 500 });
    }
}

/**
 * POST: Confirmar Cancelamento pelo Hóspede
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const { id } = params;
        const reservation = await db.reservation.findUnique({
            where: { id },
            include: {
                guest: true,
                payments: { where: { status: 'APPROVED' } },
                property: { include: { cancellationPolicy: true } }
            }
        });

        if (!reservation || reservation.guest.email !== session.user.email) {
            return NextResponse.json({ error: 'Reserva não encontrada.' }, { status: 404 });
        }

        if (!canReservationBeCancelled(reservation.status)) {
            return NextResponse.json({ error: 'Esta reserva não pode mais ser cancelada.' }, { status: 400 });
        }

        const totalPaid = reservation.payments.reduce((sum, p) => sum + p.amount, 0);
        const refundCalc = calculateRefundAmount(reservation.checkIn, totalPaid, reservation.property.cancellationPolicy);

        const result = await db.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(2002)`;

            // 1. Atualizar Status
            const updated = await tx.reservation.update({
                where: { id },
                data: { status: getNewStatusAfterCancellation("GUEST") }
            });

            // 2. Liberar Calendário
            await tx.blockedDate.deleteMany({ where: { reservationId: id } });

            // 3. Processar Reembolsos parciais/totais baseados na política
            const refundResults = [];
            if (refundCalc.refundAmount > 0) {
                // Estratégia simples: distribuir o valor do reembolso entre os pagamentos aprovados
                let remainingToRefund = refundCalc.refundAmount;

                for (const payment of reservation.payments) {
                    if (remainingToRefund <= 0) break;
                    if (!payment.externalId) continue;

                    const refundForThisPayment = Math.min(payment.amount, remainingToRefund);

                    try {
                        const refund = await refundPayment({
                            paymentId: payment.externalId,
                            amount: refundForThisPayment
                        });

                        await tx.payment.update({
                            where: { id: payment.id },
                            data: {
                                status: refundForThisPayment === payment.amount ? 'REFUNDED' : payment.status,
                                refundAmount: refundForThisPayment,
                                refundStatus: 'COMPLETED',
                                refundProviderId: refund.id,
                                refundedAt: new Date()
                            }
                        });

                        remainingToRefund -= refundForThisPayment;
                        refundResults.push({ id: payment.id, amount: refundForThisPayment, success: true });
                    } catch (err: any) {
                        refundResults.push({ id: payment.id, success: false, error: err.message });
                    }
                }
            }

            // 4. Auditoria
            await tx.reservationEvent.create({
                data: {
                    reservationId: id,
                    type: 'CANCELLED_BY_GUEST',
                    reason: 'Cancelado pelo hóspede via painel',
                    metadata: {
                        refundCalc,
                        refundResults
                    }
                }
            });

            // 5. Ajustar Receita
            if (refundCalc.refundAmount > 0) {
                await tx.guest.update({
                    where: { id: reservation.guestId },
                    data: { totalRevenueGenerated: { decrement: refundCalc.refundAmount } }
                });
            }

            return updated;
        });

        // 6. Sincronizar Channex
        channex.pushAvailability(
            reservation.propertyId,
            format(reservation.checkIn, "yyyy-MM-dd"),
            format(reservation.checkOut, "yyyy-MM-dd")
        ).catch(err => console.error("[Channex Sync Error]:", err));

        return NextResponse.json({
            success: true,
            reservation: result,
            refundApplied: refundCalc.refundAmount
        });

    } catch (error: any) {
        console.error('Guest Cancellation Error:', error);
        return NextResponse.json({ error: error.message || 'Erro ao cancelar reserva.' }, { status: 500 });
    }
}
