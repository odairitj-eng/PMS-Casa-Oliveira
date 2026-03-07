import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Busca todas as reservas vinculadas ao e-mail do usuário via relacionamento com Guest
        const reservations = await db.reservation.findMany({
            where: {
                guest: {
                    email: session.user.email
                }
            },
            orderBy: {
                checkIn: 'desc'
            }
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Erro ao buscar reservas do usuário", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
