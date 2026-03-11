import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireUser";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await requireAdmin();
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
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function PATCH(req: Request) {
    try {
        await requireAdmin();
        const { userId, role } = await req.json();

        if (!userId || !role) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Não permitir alterar a própria role via esta API (segurança básica)
        // No futuro poderíamos checar o ID da sessão

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { role }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}
