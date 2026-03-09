export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';

import { propertySchema } from '@/lib/validations/schemas';

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
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado. Acesso restrito a administradores.' }, { status: 403 });
        }

        const properties = await db.property.findMany({
            orderBy: { createdAt: 'desc' }, // Novas primeiro por segurança/UX
            select: {
                id: true,
                name: true,
                slug: true,
                publicTitle: true,
                channexId: true,
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
    } catch (err: any) {
        console.error('[SECURITY AUDIT] Unauthorized access attempt or error:', err.message);
        return NextResponse.json({ error: 'Erro ao processar requisição.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
        }

        const body = await req.json();

        // VALIDAÇÃO RIGOROSA COM ZOD
        const validation = propertySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: 'Dados inválidos.',
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { name, basePrice, ...rest } = validation.data;

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
                basePrice,
                ...rest,
            },
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error: any) {
        console.error('[Properties POST Error]', error.message);
        return NextResponse.json({ error: 'Erro ao criar imóvel.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, channexId } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID do imóvel é obrigatório.' }, { status: 400 });
        }

        const property = await db.property.update({
            where: { id },
            data: { channexId },
        });

        return NextResponse.json(property);
    } catch (error: any) {
        console.error('[Properties PATCH Error]', error);
        return NextResponse.json({ error: 'Erro ao atualizar imóvel.' }, { status: 500 });
    }
}
