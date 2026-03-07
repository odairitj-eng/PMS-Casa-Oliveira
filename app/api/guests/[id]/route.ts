import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { name, email, phone, isVip, notes } = body;

        const guest = await db.guest.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                isVip,
                notes
            }
        });

        return NextResponse.json(guest);
    } catch (error) {
        console.error("Erro ao atualizar hóspede", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { id } = params;

        // Verifica se existem reservas vinculadas
        const reservationsCount = await db.reservation.count({
            where: { guestId: id }
        });

        if (reservationsCount > 0) {
            return NextResponse.json({
                error: "Não é possível excluir um hóspede que possui reservas vinculadas."
            }, { status: 400 });
        }

        await db.guest.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Hóspede removido com sucesso" });
    } catch (error) {
        console.error("Erro ao remover hóspede", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
