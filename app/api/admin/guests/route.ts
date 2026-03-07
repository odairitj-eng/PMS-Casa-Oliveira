import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    try {
        const guests = await db.guest.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { reservations: true } }
            }
        });

        return NextResponse.json(guests);
    } catch (error: any) {
        console.error('[Guest API Error]', error);
        return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, phone, isVip, isFiveStar, status, sourceChannel, notes } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 });
        }

        const guest = await db.guest.create({
            data: {
                name,
                email,
                phone: phone || '',
                isVip: isVip ?? false,
                isFiveStar: isFiveStar ?? false,
                status: status || 'REGULAR',
                sourceChannel: sourceChannel || 'MANUAL',
                notes: notes || null,
            }
        });

        return NextResponse.json(guest, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Já existe um hóspede com este e-mail.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Erro ao criar hóspede.' }, { status: 500 });
    }
}
