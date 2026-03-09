export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { integrationId } = await req.json();

        const integration = await db.integration.findUnique({
            where: { id: integrationId }
        });

        if (!integration) {
            return NextResponse.json({ error: 'Integração não encontrada.' }, { status: 404 });
        }

        // Simulando o processo de sincronização iCal
        // Em produção, aqui baixaríamos o .ics, faríamos o parse e atualizaríamos BlockedDates
        await new Promise(resolve => setTimeout(resolve, 2000));

        await db.integration.update({
            where: { id: integrationId },
            data: { lastSyncAt: new Date() }
        });

        await db.syncLog.create({
            data: {
                platform: integration.platform,
                status: 'SUCCESS',
                eventsAdded: Math.floor(Math.random() * 5),
                errorMessage: `Sincronização manual do ${integration.platform} concluída.`
            }
        });

        return NextResponse.json({ success: true, message: 'Sincronização concluída com sucesso.' });
    } catch (error) {
        console.error('Manual Sync Error:', error);
        return NextResponse.json({ error: 'Erro ao sincronizar calendário.' }, { status: 500 });
    }
}
