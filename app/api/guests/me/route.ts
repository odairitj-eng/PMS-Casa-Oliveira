import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const guest = await db.guest.findUnique({
            where: { email: session.user.email },
        });

        if (!guest) {
            return NextResponse.json({ error: "Hóspede não encontrado" }, { status: 404 });
        }

        return NextResponse.json(guest);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar hóspede" }, { status: 500 });
    }
}
