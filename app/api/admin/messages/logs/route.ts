import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

/**
 * GET: Lista o histórico de mensagens enviadas
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const guestId = searchParams.get("guestId");
        const reservationId = searchParams.get("reservationId");

        const logs = await (db as any).messageLog.findMany({
            where: {
                ...(guestId ? { guestId } : {}),
                ...(reservationId ? { reservationId } : {}),
            },
            include: {
                guest: { select: { name: true, email: true } },
                reservation: { select: { checkIn: true, checkOut: true } },
                template: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
