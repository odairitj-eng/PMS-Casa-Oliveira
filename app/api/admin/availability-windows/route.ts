export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { addDays, startOfDay, differenceInDays } from "date-fns";

export async function GET() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const windows = await db.availabilityWindow.findMany({
            orderBy: { startDate: "asc" }
        });
        return NextResponse.json(windows);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar janelas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { startDate, endDate, mode, rollingDays, propertyId } = body;

        if (!propertyId || !startDate || (mode === "MANUAL_RANGE" && !endDate)) {
            return NextResponse.json({ error: "Dados insuficientes" }, { status: 400 });
        }

        const start = startOfDay(new Date(startDate));
        let finalEndDate = endDate ? startOfDay(new Date(endDate)) : null;

        if (mode === "ROLLING_FROM_TODAY") {
            const days = rollingDays || 90;
            finalEndDate = startOfDay(addDays(new Date(), days));
        }

        if (!finalEndDate) {
            return NextResponse.json({ error: "Data de fim inválida" }, { status: 400 });
        }

        // Validação básica: não permitir abrir janelas puramente no passado (opcional, dependendo da necessidade do negócio)
        const today = startOfDay(new Date());
        if (finalEndDate < today) {
            return NextResponse.json({ error: "Não é possível abrir uma janela totalmente no passado" }, { status: 400 });
        }

        const window = await db.$transaction(async (tx) => {
            // 1. Limpar bloqueios manuais/admin
            await tx.blockedDate.deleteMany({
                where: {
                    propertyId,
                    date: { gte: start, lte: finalEndDate as Date },
                    source: { in: ["MANUAL", "ADMIN"] }
                }
            });

            // 2. Se um preço foi enviado, gravamos Overrides de preço para todo o período
            // Isso garante que a janela abra com o valor específico desejado pelo usuário
            const price = body.price ? Number(body.price) : null;

            // Independente de vir preço novo, limpamos os antigos para esse período
            await tx.nightlyOverride.deleteMany({
                where: {
                    propertyId,
                    date: { gte: start, lte: finalEndDate as Date }
                }
            });

            if (price) {
                const daysDiff = differenceInDays(finalEndDate as Date, start);
                const overrides = [];
                for (let i = 0; i <= daysDiff; i++) {
                    overrides.push({
                        propertyId,
                        date: addDays(start, i),
                        price: price
                    });
                }
                if (overrides.length > 0) {
                    await tx.nightlyOverride.createMany({
                        data: overrides
                    });
                }
            }

            // 3. Cria a janela de disponibilidade
            return await tx.availabilityWindow.create({
                data: {
                    propertyId,
                    startDate: start,
                    endDate: finalEndDate as Date,
                    mode,
                    rollingDays: mode === "ROLLING_FROM_TODAY" ? rollingDays : null,
                    isActive: true
                }
            });
        });

        return NextResponse.json(window);
    } catch (error) {
        console.error("Erro ao criar janela:", error);
        return NextResponse.json({ error: "Erro ao criar janela" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

        await db.availabilityWindow.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao deletar janela" }, { status: 500 });
    }
}
