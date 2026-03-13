export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { refundPayment } from "@/lib/payments";
import { calculateRefundAmount, getNewStatusAfterCancellation, generateCreditCode } from "@/lib/cancellation";
import { channex } from "@/lib/channex";
import { format } from "date-fns";

/**
 * Endpoint de Cancelamento Administrativo
 * Permite que um administrador cancele qualquer reserva e gerencie o reembolso.
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

        const { id } = params;
        const body = await req.json();
        const { reason, confirmRefund = true, convertToCredit = false } = body;

        if (!reason) {
            return NextResponse.json({ error: 'O motivo do cancelamento é obrigatório.' }, { status: 400 });
        }

        // 1. Buscar a reserva com pagamentos e política
        const reservation = await db.reservation.findUnique({
            where: { id },
            include: {
                payments: {
                    where: { status: 'APPROVED' }
                },
                property: {
                    include: { cancellationPolicy: true }
                }
            }
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Reserva não encontrada.' }, { status: 404 });
        }

        if (reservation.status.startsWith('CANCELLED') || reservation.status === 'EXPIRED') {
            return NextResponse.json({ error: 'Esta reserva já foi cancelada ou expirada.' }, { status: 400 });
        }

        const totalPaid = reservation.payments.reduce((sum, p) => sum + p.amount, 0);

        // 2. Calcular reembolso sugerido (Políticas)
        const suggestion = calculateRefundAmount(reservation.checkIn, totalPaid, reservation.property.cancellationPolicy);

        const result = await db.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(2001)`;

            const updatedReservation = await tx.reservation.update({
                where: { id },
                data: {
                    status: getNewStatusAfterCancellation("HOST"),
                }
            });

            await tx.blockedDate.deleteMany({
                where: { reservationId: id }
            });

            const refundResults = [];
            let creditedAmount = 0;
            let creditCode = "";

            // 5. Processar Destino Financeiro (Reembolso ou Crédito)
            if (totalPaid > 0) {
                if (confirmRefund) {
                    // FLUXO A: Reembolso via Gateway
                    for (const payment of reservation.payments) {
                        if (payment.externalId && payment.provider === 'MERCADO_PAGO') {
                            try {
                                const refund = await refundPayment({
                                    paymentId: payment.externalId,
                                    amount: payment.amount
                                });

                                await tx.payment.update({
                                    where: { id: payment.id },
                                    data: {
                                        status: 'REFUNDED',
                                        refundAmount: payment.amount,
                                        refundStatus: 'COMPLETED',
                                        refundProviderId: refund.id,
                                        refundedAt: new Date()
                                    }
                                });
                                refundResults.push({ id: payment.id, success: true });
                            } catch (err: any) {
                                console.error(`Failed to refund payment ${payment.id}:`, err.message);
                                refundResults.push({ id: payment.id, success: false, error: err.message });
                            }
                        }
                    }
                } else if (convertToCredit) {
                    // FLUXO B: Conversão em Crédito do Sistema
                    creditCode = generateCreditCode();
                    creditedAmount = totalPaid;

                    const twelveMonthsFromNow = new Date();
                    twelveMonthsFromNow.setFullYear(twelveMonthsFromNow.getFullYear() + 1);

                    await tx.reservationCredit.create({
                        data: {
                            guestId: reservation.guestId,
                            sourceReservationId: reservation.id,
                            amountOriginal: creditedAmount,
                            amountAvailable: creditedAmount,
                            code: creditCode,
                            reason: `Crédito originado do cancelamento da reserva ${reservation.id}`,
                            expiresAt: twelveMonthsFromNow,
                            status: "ACTIVE"
                        }
                    });
                }
            }

            // 6. Registrar Evento de Auditoria Detalhada
            await tx.reservationEvent.create({
                data: {
                    reservationId: id,
                    type: 'CANCELLED_BY_HOST',
                    userId: (session.user as any).id,
                    reason: reason,
                    metadata: {
                        totalPaid,
                        refunded: confirmRefund,
                        convertedToCredit: convertToCredit,
                        creditedAmount: creditedAmount,
                        creditCode: creditCode,
                        refundResults: refundResults as any,
                        policySuggestion: suggestion as any
                    }
                }
            });

            // 7. Atualizar estatísticas do hóspede (Diminuir receita apenas se houver reembolso externo)
            // Se virou crédito, a receita "ainda existe" no sistema como passivo
            if (totalPaid > 0 && confirmRefund) {
                await tx.guest.update({
                    where: { id: reservation.guestId },
                    data: {
                        totalRevenueGenerated: { decrement: totalPaid }
                    }
                });
            }

            return updatedReservation;
        });

        // 8. Sincronizar Channex (Assíncrono)
        channex.pushAvailability(
            reservation.propertyId,
            format(reservation.checkIn, "yyyy-MM-dd"),
            format(reservation.checkOut, "yyyy-MM-dd")
        ).catch(err => console.error("[Channex Sync Error]:", err));

        return NextResponse.json({
            success: true,
            reservation: result,
            refunded: confirmRefund
        });

    } catch (error: any) {
        console.error('Admin Cancellation Error:', error);
        return NextResponse.json({ error: error.message || 'Erro interno ao cancelar reserva.' }, { status: 500 });
    }
}
