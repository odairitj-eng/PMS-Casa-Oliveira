import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const { guestId, discount = 0.1, expiresDays = 7 } = await req.json();

        if (!guestId) {
            return NextResponse.json({ error: 'Hóspede não informado.' }, { status: 400 });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresDays);

        const token = uuidv4().substring(0, 8).toUpperCase();

        const link = await db.reservationLink.create({
            data: {
                token,
                discount,
                expiresAt,
                // Podemos adicionar metadados se necessário
            }
        });

        // Retorna a URL completa (ajustar conforme o domínio real se necessário)
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const vipUrl = `${baseUrl}/reserve/${token}?guestId=${guestId}`;

        return NextResponse.json({
            token,
            url: vipUrl,
            expiresAt
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar link VIP.' }, { status: 500 });
    }
}
