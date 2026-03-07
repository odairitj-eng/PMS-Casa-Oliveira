import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const properties = await db.property.findMany({
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            name: true,
            slug: true,
            publicTitle: true,
            isActive: true,
            city: true,
            state: true,
            basePrice: true,
            maxGuests: true,
            createdAt: true,
            _count: { select: { reservations: true, photos: true } },
        },
    });

    return NextResponse.json(properties);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, basePrice, ...rest } = body;

        if (!name || !basePrice) {
            return NextResponse.json({ error: 'Nome e preço base são obrigatórios.' }, { status: 400 });
        }

        // Generate a unique slug
        let slug = generateSlug(name);
        const existing = await db.property.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        const property = await db.property.create({
            data: {
                name,
                slug,
                basePrice: parseFloat(basePrice),
                ...rest,
            },
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error: any) {
        console.error('[Properties POST Error]', error);
        return NextResponse.json({ error: 'Erro ao criar imóvel.' }, { status: 500 });
    }
}
