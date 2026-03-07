import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { addDays, startOfDay } from "date-fns";

/**
 * Endpoint para disparar manualmente o recálculo das janelas ROLLING.
 * Em produção, este código seria chamado por um Cron Job diário.
 */
export async function POST() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const rollingWindows = await db.availabilityWindow.findMany({
            where: { mode: "ROLLING_FROM_TODAY", isActive: true }
        });

        const today = startOfDay(new Date());

        for (const window of rollingWindows) {
            if (window.rollingDays) {
                const newEndDate = startOfDay(addDays(today, window.rollingDays));

                await db.availabilityWindow.update({
                    where: { id: window.id },
                    data: {
                        endDate: newEndDate,
                        updatedAt: new Date()
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `${rollingWindows.length} janelas rolling recalculadas a partir de hoje.`
        });
    } catch (error) {
        console.error("Erro ao recalcular janelas:", error);
        return NextResponse.json({ error: "Erro ao recalcular janelas" }, { status: 500 });
    }
}
