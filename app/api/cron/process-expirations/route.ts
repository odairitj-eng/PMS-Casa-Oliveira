import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Endpoint de Cron para expiração automática de reservas não pagas.
 * Deve ser chamado periodicamente (ex: a cada 5 minutos).
 */
export async function GET(request: Request) {
    // Opcional: Validar token secreto se configurado no ENV para evitar chamadas externas maliciosas
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const now = new Date();

        // 1. Encontrar reservas pendentes com hold expirado
        const expiredReservations = await db.reservation.findMany({
            where: {
                status: "PENDING_PAYMENT",
                holdExpiresAt: {
                    lt: now,
                },
            },
            include: {
                payments: {
                    where: {
                        status: "PENDING",
                    }
                }
            }
        });

        if (expiredReservations.length === 0) {
            return NextResponse.json({ message: "No expired reservations found." });
        }

        const results = [];

        for (const res of expiredReservations) {
            try {
                // Usar transação para garantir que tudo ocorra ou nada ocorra
                await db.$transaction(async (tx: any) => {
                    // A) Atualizar status da reserva
                    await tx.reservation.update({
                        where: { id: res.id },
                        data: { status: "EXPIRED" },
                    });

                    // B) Atualizar status dos pagamentos pendentes
                    if (res.payments.length > 0) {
                        await tx.payment.updateMany({
                            where: {
                                reservationId: res.id,
                                status: "PENDING"
                            },
                            data: { status: "EXPIRED" },
                        });
                    }

                    // C) Liberar as datas bloqueadas (BlockedDates)
                    await tx.blockedDate.deleteMany({
                        where: { reservationId: res.id },
                    });

                    // D) Registrar evento de auditoria
                    await tx.reservationEvent.create({
                        data: {
                            reservationId: res.id,
                            type: "SYSTEM_EXPIRED",
                            reason: "Pagamento não concluído dentro do prazo de hold.",
                            metadata: {
                                holdExpiresAt: res.holdExpiresAt,
                                processedAt: now,
                            },
                        },
                    });
                });

                results.push({ id: res.id, status: "EXPIRED_SUCCESS" });
            } catch (err: any) {
                console.error(`Failed to expire reservation ${res.id}:`, err);
                results.push({ id: res.id, status: "ERROR", error: err.message });
            }
        }

        return NextResponse.json({
            processedCount: expiredReservations.length,
            details: results,
        });
    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
