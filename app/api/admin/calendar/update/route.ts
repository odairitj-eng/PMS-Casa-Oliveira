import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { startOfDay, addDays } from "date-fns";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { startDate, endDate, price, minNights, isAvailable, reason, propertyId } = body;

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID é obrigatório" }, { status: 400 });
        }

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "Datas de início e fim são obrigatórias" }, { status: 400 });
        }

        const start = startOfDay(new Date(startDate));
        const end = startOfDay(new Date(endDate));

        if (start > end) {
            return NextResponse.json({ error: "Data de início deve ser anterior à data de fim" }, { status: 400 });
        }

        const days: Date[] = [];
        let current = start;
        while (current <= end) {
            days.push(new Date(current));
            current = addDays(current, 1);
        }

        // Antes de bloquear, verificar se há reservas confirmadas no período (Proteção contra overbooking manual)
        if (isAvailable === false) {
            const conflictingReservations = await db.reservation.findMany({
                where: {
                    propertyId,
                    status: "CONFIRMED",
                    OR: [
                        { checkIn: { lte: end }, checkOut: { gt: start } }
                    ]
                }
            });

            if (conflictingReservations.length > 0) {
                return NextResponse.json({
                    error: "Não é possível bloquear manualmente: existem reservas confirmadas neste período.",
                    conflicts: conflictingReservations.length
                }, { status: 400 });
            }
        }

        // Atualização em lote usando transação
        await db.$transaction(async (tx: any) => {
            for (const date of days) {
                // 1. Lógica de Preço e Estadia Mínima
                const parsedPrice = price !== undefined && price !== "" ? parseFloat(price) : undefined;
                const parsedMinNights = minNights !== undefined && minNights !== "" ? parseInt(minNights) : undefined;

                if (parsedPrice !== undefined || parsedMinNights !== undefined) {
                    const data: any = { propertyId, date };
                    if (parsedPrice !== undefined) data.price = parsedPrice;
                    if (parsedMinNights !== undefined) data.minimumNights = parsedMinNights; // Atenção: No schema é minimumNights

                    await tx.nightlyOverride.upsert({
                        where: { propertyId_date: { propertyId, date } },
                        update: {
                            ...(parsedPrice !== undefined && { price: parsedPrice }),
                            ...(parsedMinNights !== undefined && { minimumNights: parsedMinNights }),
                        },
                        create: data,
                    });
                }

                // 2. Lógica de Disponibilidade (Bloqueio Manual)
                if (isAvailable !== undefined) {
                    if (isAvailable) {
                        // Se disponível, remove APENAS bloqueios manuais ou de admin antigo
                        await tx.blockedDate.deleteMany({
                            where: {
                                propertyId,
                                date,
                                source: { in: ["MANUAL", "ADMIN"] }
                            }
                        });
                    } else {
                        // Se indisponível, cria bloqueio com fonte MANUAL e motivo
                        await tx.blockedDate.upsert({
                            where: { propertyId_date: { propertyId, date } },
                            update: {
                                source: "MANUAL",
                                reason: reason || "Bloqueio administrativo"
                            },
                            create: {
                                propertyId,
                                date,
                                source: "MANUAL",
                                reason: reason || "Bloqueio administrativo"
                            }
                        });
                    }
                }
            }
        });

        return NextResponse.json({ success: true, message: `${days.length} dias atualizados com sucesso.` });
    } catch (error: any) {
        console.error("Erro ao atualizar calendário:", error);
        return NextResponse.json({ error: "Erro interno ao atualizar calendário" }, { status: 500 });
    }
}
