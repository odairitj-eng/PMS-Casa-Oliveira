export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncIcalEvents } from '@/lib/calendar';

export async function POST(req: NextRequest) {
    try {
        const { integrationId } = await req.json();

        const integration = await db.integration.findUnique({
            where: { id: integrationId }
        }) as any;

        if (!integration) {
            return NextResponse.json({ error: 'Integração não encontrada.' }, { status: 404 });
        }

        // CHAMADA REAL DA SINCRONIZAÇÃO
        const result = await syncIcalEvents(integration.propertyId, integration.id);

        return NextResponse.json({
            success: true,
            message: `Sincronização concluída. ${result.count} noites bloqueadas.`
        });
    } catch (error: any) {
        console.error('Manual Sync Error:', error);
        return NextResponse.json({ error: error.message || 'Erro ao sincronizar calendário.' }, { status: 500 });
    }
}
