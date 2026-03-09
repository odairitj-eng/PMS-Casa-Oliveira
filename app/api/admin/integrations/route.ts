export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    try {
        const integrations = await db.integration.findMany({
            where: propertyId ? { propertyId } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(integrations);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar integrações.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const { platform, icalUrl, propertyId } = await req.json();

        if (!platform || !icalUrl) {
            return NextResponse.json({ error: 'Plataforma e URL são obrigatórios.' }, { status: 400 });
        }

        // Resolve propertyId: use provided, or fallback to the first active property
        let resolvedPropertyId = propertyId;
        if (!resolvedPropertyId) {
            const firstProperty = await db.property.findFirst({
                where: { isActive: true },
                select: { id: true },
                orderBy: { createdAt: 'asc' },
            });
            resolvedPropertyId = firstProperty?.id;
        }

        if (!resolvedPropertyId) {
            return NextResponse.json({ error: 'Nenhum imóvel encontrado para associar.' }, { status: 400 });
        }

        const integration = await db.integration.create({
            data: { platform, icalUrl, propertyId: resolvedPropertyId },
        });

        return NextResponse.json(integration);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar integração.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID da integração é obrigatório.' }, { status: 400 });
        }

        await db.integration.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao remover integração.' }, { status: 500 });
    }
}
