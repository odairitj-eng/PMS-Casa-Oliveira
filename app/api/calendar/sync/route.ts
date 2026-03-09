import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchAndParseICal, getSourceFromPlatform } from '@/lib/ical';
import { eachDayOfInterval, startOfDay } from 'date-fns';

export async function POST(req: NextRequest) {
    try {
        const { propertyId } = await req.json();

        // Se propertyId for fornecido, sincroniza apenas ela. Caso contrário, todas.
        const integrations = await db.integration.findMany({
            where: propertyId ? { propertyId } : {},
            include: { property: true }
        });

        const results = [];

        for (const integration of integrations) {
            try {
                const events = await fetchAndParseICal(integration.icalUrl);
                const source = getSourceFromPlatform(integration.platform);

                await db.$transaction(async (tx) => {
                    // 1. Limpar bloqueios antigos desta fonte para esta propriedade
                    await tx.blockedDate.deleteMany({
                        where: {
                            propertyId: integration.propertyId,
                            source: source
                        }
                    });

                    // 2. Criar novos bloqueios baseados nos eventos
                    const dateEntries: { propertyId: string; date: Date; source: any; reason: string }[] = [];

                    for (const ev of events) {
                        // O iCal costuma marcar o end como o dia seguinte ao checkout
                        // Precisamos bloquear todos os dias entre start e end-1day
                        const days = eachDayOfInterval({
                            start: startOfDay(ev.start),
                            end: startOfDay(new Date(ev.end.getTime() - 1))
                        });

                        for (const day of days) {
                            dateEntries.push({
                                propertyId: integration.propertyId,
                                date: day,
                                source: source,
                                reason: ev.summary || 'Sincronização iCal'
                            });
                        }
                    }

                    // Evitar duplicatas em dateEntries (caso o iCal tenha overlaps bizarros)
                    const uniqueEntries = Array.from(new Set(dateEntries.map(e => e.date.getTime())))
                        .map(time => dateEntries.find(e => e.date.getTime() === time)!);

                    if (uniqueEntries.length > 0) {
                        await tx.blockedDate.createMany({
                            data: uniqueEntries
                        });
                    }

                    // 3. Atualizar carimbo de sucesso
                    await tx.integration.update({
                        where: { id: integration.id },
                        data: { lastSyncAt: new Date() }
                    });

                    await tx.syncLog.create({
                        data: {
                            propertyId: integration.propertyId,
                            platform: integration.platform,
                            status: 'SUCCESS',
                            eventsAdded: uniqueEntries.length
                        }
                    });
                });

                results.push({ platform: integration.platform, status: 'SUCCESS', events: events.length });

            } catch (err: any) {
                console.error(`Falha ao sincronizar ${integration.platform}:`, err.message);
                await db.syncLog.create({
                    data: {
                        propertyId: integration.propertyId,
                        platform: integration.platform,
                        status: 'FAILED',
                        errorMessage: err.message
                    }
                });
                results.push({ platform: integration.platform, status: 'FAILED', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error: any) {
        console.error('Global Sync Error:', error);
        return NextResponse.json({ error: 'Erro ao processar sincronização.' }, { status: 500 });
    }
}
