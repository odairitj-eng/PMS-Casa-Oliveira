export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

/**
 * Guest Details & Actions (Admin)
 */
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await context.params;

    const guest = await db.guest.findUnique({
        where: { id },
        include: {
            reservations: {
                orderBy: { checkIn: 'desc' },
                include: {
                    property: { select: { name: true, checkInStart: true, checkInEnd: true, checkOutEnd: true } }
                }
            }
        }
    });

    if (!guest) {
        return NextResponse.json({ error: 'Hóspede não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(guest);
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const body = await req.json();
        const { isVip, isFiveStar, status, notes, name, email, phone, sourceChannel } = body;

        const updated = await db.guest.update({
            where: { id },
            data: {
                isVip,
                isFiveStar,
                status,
                notes,
                name,
                email,
                phone,
                sourceChannel,
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: 'Erro ao atualizar hóspede.' }, { status: 500 });
    }
}
