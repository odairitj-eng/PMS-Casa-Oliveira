import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireUser";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await requireAdmin();

        // 1. Busca usuários que já logaram
        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // 2. Busca hóspedes que NÃO possuem usuário vinculado ainda
        const guestsWithoutUser = await db.guest.findMany({
            where: {
                userId: null
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        });

        // 3. Formata os hóspedes como "Usuários Pendentes"
        const pendingUsers = guestsWithoutUser.map((g: any) => ({
            id: `pending-${g.id}`,
            name: g.name,
            email: g.email,
            role: 'USER', // Valor padrão
            image: null,
            createdAt: g.createdAt,
            isPending: true,
            guestId: g.id
        }));

        return NextResponse.json([...users, ...pendingUsers]);
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function PATCH(req: Request) {
    try {
        await requireAdmin();
        const { userId, role, guestId, email, name } = await req.json();

        if (!userId && !guestId) {
            return NextResponse.json({ error: "Missing identity" }, { status: 400 });
        }

        // Se for um usuário pendente (hóspede sem User), cria o User agora
        if (userId?.startsWith('pending-') && guestId && email) {
            const newUser = await db.user.create({
                data: {
                    email,
                    name: name || "Hóspede",
                    role: role
                }
            });

            await db.guest.update({
                where: { id: guestId },
                data: { userId: newUser.id }
            });

        } else {
            await db.user.update({
                where: { id: userId },
                data: { role }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user", error);
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}
