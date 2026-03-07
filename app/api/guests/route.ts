import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const guests = await db.guest.findMany({
            include: {
                _count: {
                    select: { reservations: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Mapeia para um formato mais amigável
        const formattedGuests = guests.map(g => ({
            ...g,
            stays: g._count.reservations
        }));

        return NextResponse.json(formattedGuests);
    } catch (error) {
        console.error("Erro ao buscar hóspedes", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, isVip, notes } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Nome e e-mail são obrigatórios" }, { status: 400 });
        }

        const guest = await db.guest.create({
            data: {
                name,
                email,
                phone: phone || "",
                isVip: !!isVip,
                notes: notes || ""
            }
        });

        return NextResponse.json(guest);
    } catch (error: any) {
        console.error("Erro ao criar hóspede", error);

        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 400 });
        }

        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
