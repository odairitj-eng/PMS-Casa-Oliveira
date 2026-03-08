import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Gerencia as regras de precificação inteligente.
 */
export async function GET() {
    const rules = await db.pricingRule.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
    try {
        const { type, value, description, minDays, startDate, endDate, color, propertyId = 'casa-oliveira-id' } = await req.json();

        if (!type || !value) {
            return NextResponse.json({ error: 'Tipo e valor são obrigatórios.' }, { status: 400 });
        }

        const rule = await db.pricingRule.create({
            data: {
                type,
                value,
                description,
                minDays: minDays ? parseInt(minDays) : null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                color,
                propertyId
            }
        });

        return NextResponse.json(rule);
    } catch (error: any) {
        return NextResponse.json({ error: 'Erro ao criar regra de preço.' }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID não fornecido.' }, { status: 400 });

    await db.pricingRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
