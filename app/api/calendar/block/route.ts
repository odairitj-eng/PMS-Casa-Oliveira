import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { propertyId, startDate, endDate, reason } = await req.json();

        if (!propertyId || !startDate || !endDate) {
            return NextResponse.json({ error: 'Dados insuficientes para o bloqueio.' }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Gerar array de datas para bloquear
        const datesToBlock: any[] = [];
        let current = new Date(start);
        while (current < end) {
            datesToBlock.push({
                propertyId,
                date: new Date(current),
                source: 'ADMIN',
                // Opcional: Adicionar razão/nota aqui se o esquema permitir futuramente
            });
            current.setDate(current.getDate() + 1);
        }

        // Usar transação para garantir atomicidade e evitar conflitos
        await db.$transaction(async (tx: any) => {
            // 1. Verificar se já existem bloqueios ou reservas CONFIRMADAS para o período
            const conflicts = await tx.blockedDate.findFirst({
                where: {
                    propertyId,
                    date: { gte: start, lt: end },
                }
            });

            if (conflicts) {
                throw new Error("Já existem datas ocupadas ou bloqueadas neste período.");
            }

            // 2. Criar os bloqueios
            await tx.blockedDate.createMany({
                data: datesToBlock
            });
        });

        return NextResponse.json({ success: true, message: 'Datas bloqueadas com sucesso.' });

    } catch (error: any) {
        console.error('Manual Block Error:', error);
        return NextResponse.json({ error: error.message || 'Erro ao processar bloqueio manual.' }, { status: 400 });
    }
}
