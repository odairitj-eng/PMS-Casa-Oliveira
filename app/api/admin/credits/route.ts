import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

/**
 * API Administrativa para listar e gerenciar créditos
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const guestId = searchParams.get("guestId");
        const status = searchParams.get("status");

        const where: any = {};
        if (guestId) where.guestId = guestId;
        if (status) where.status = status;

        const credits = await db.reservationCredit.findMany({
            where,
            include: {
                guest: {
                    select: { name: true, email: true }
                },
                sourceReservation: {
                    select: { id: true, checkIn: true, checkOut: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(credits);
    } catch (error: any) {
        console.error("Admin Credits API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Permite criar um crédito manual ou expirar/cancelar um crédito existente
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const body = await req.json();
        const { creditId, newStatus, reason } = body;

        const updated = await db.reservationCredit.update({
            where: { id: creditId },
            data: {
                status: newStatus,
                reason: reason ? `${reason} (Ação manual admin)` : undefined
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Admin Credits PATCH Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
