import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const property = await db.property.findUnique({
        where: { id: params.id },
        include: {
            photos: { orderBy: { sortOrder: 'asc' } },
            amenities: { orderBy: { sortOrder: 'asc' } },
            rules: { orderBy: { sortOrder: 'asc' } },
            _count: { select: { reservations: true } },
        },
    });

    if (!property) {
        return NextResponse.json({ error: 'Imóvel não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(property);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Remove known relation arrays, meta-fields, and id/slug before passing to update
        const {
            slug: _,
            id: __,
            createdAt: ___,
            updatedAt: ____,
            photos: _p,
            amenities: _a,
            rules: _r,
            reservations: _res,
            _count: _c,
            ...data
        } = body;

        const updated = await db.property.update({
            where: { id: params.id },
            data,
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('[Properties PATCH Error]', error);
        return NextResponse.json({ error: 'Erro ao atualizar imóvel.' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        // Soft delete: just deactivate
        const updated = await db.property.update({
            where: { id: params.id },
            data: { isActive: false },
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: 'Erro ao desativar imóvel.' }, { status: 500 });
    }
}
