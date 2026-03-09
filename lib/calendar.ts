import { db } from './db';
import axios from 'axios';

/**
 * Função utilitária para gerar arquivo .ics contendo APENAS as reservas confirmadas
 * ou datas bloqueadas manualmente por administradores.
 */
export async function generateIcalFeed(propertyId: string) {
    // Busca datas garantidas (não inclui eventos importados (AIRBNB, BOOKING) para evitar loop)
    const blockedDates = await db.blockedDate.findMany({
        where: {
            propertyId,
            source: { in: ['DIRECT_RESERVATION', 'ADMIN', 'MANUAL'] }
        },
        include: {
            reservation: true
        }
    });

    // Agrupar datas conjuntas em "Eventos Longos" para o ICS
    // Para simplificar, neste exemplo vamos criar 1 VEVENT por noite (funciona para Airbnb)
    // Em produção o ideal é agrupar CheckIn -> CheckOut.

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Casa Oliveira//Booking Engine//PT-BR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n';

    for (const date of blockedDates) {
        const start = new Date(date.date);
        // VEVENT Ocupa a noite em questão (termina no dia seguinte)
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const formatDt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('T')[0];

        icsContent += [
            'BEGIN:VEVENT',
            `UID:${date.id}@casaoliveira.com.br`,
            `DTSTAMP:${formatDt(new Date())}T000000Z`,
            `DTSTART;VALUE=DATE:${formatDt(start)}`,
            `DTEND;VALUE=DATE:${formatDt(end)}`,
            `SUMMARY:${date.source === 'DIRECT_RESERVATION' ? 'Casa Oliveira - Reserva' : (date.reason || 'Bloqueio Manual')}`,
            'STATUS:CONFIRMED',
            'END:VEVENT'
        ].join('\r\n') + '\r\n';
    }

    icsContent += 'END:VCALENDAR';
    return icsContent;
}

/**
 * Sincroniza eventos de um calendário externo (Airbnb, Booking) para o banco de dados.
 */
export async function syncIcalEvents(propertyId: string, integrationId: string) {
    const ical = require('node-ical');
    const integration = await db.integration.findUnique({
        where: { id: integrationId }
    }) as any;

    if (!integration || !integration.icalUrl) {
        throw new Error('Integração ou URL iCal não encontrada.');
    }

    try {
        // 1. Download do arquivo .ics
        const response = await axios.get(integration.icalUrl, {
            timeout: 10000,
            headers: { 'User-Agent': 'CasaOliveira-Bot/1.0' }
        });
        const icsData = response.data;

        // 2. Parse do conteúdo
        const events = ical.parseICS(icsData);
        const nightsToBlock: Date[] = [];

        for (const k in events) {
            if (Object.prototype.hasOwnProperty.call(events, k)) {
                const event = events[k] as any;
                if (event.type === 'VEVENT' && event.start && event.end) {
                    // Adiciona cada noite do intervalo no array
                    let current = new Date(event.start);
                    const end = new Date(event.end);

                    // iCal DTEND é exclusivo (não incluso na estadia).
                    // Percorremos de start até (end - 1 dia)
                    while (current < end) {
                        nightsToBlock.push(new Date(current));
                        current.setDate(current.getDate() + 1);
                    }
                }
            }
        }

        // 3. Atualização Atômica no Banco de Dados
        // Remove bloqueios antigos dessa fonte específica para esta propriedade para evitar duplicatas e limpar cancelamentos
        const sourceMap: Record<string, any> = {
            'AIRBNB': 'AIRBNB',
            'BOOKING': 'BOOKING',
            'CHANNEX': 'CHANNEX'
        };
        const source = sourceMap[integration.platform] || 'MANUAL';

        await db.$transaction([
            // Limpa bloqueios antigos da mesma fonte (importante para deletar reservas canceladas no Airbnb)
            db.blockedDate.deleteMany({
                where: {
                    propertyId: propertyId,
                    source: source
                }
            } as any),
            // Insere os novos bloqueios
            db.blockedDate.createMany({
                data: nightsToBlock.map(date => ({
                    propertyId: propertyId,
                    date: date,
                    source: source,
                    reason: `Importado de ${integration.platform}`
                })),
                skipDuplicates: true
            }),
            // Atualiza a data de última sincronização
            db.integration.update({
                where: { id: integrationId },
                data: { lastSyncAt: new Date() }
            }),
            // Registra o log
            db.syncLog.create({
                data: {
                    propertyId: propertyId,
                    platform: integration.platform,
                    status: 'SUCCESS',
                    eventsAdded: nightsToBlock.length,
                    errorMessage: `Sincronização do ${integration.platform} concluída. ${nightsToBlock.length} noites bloqueadas.`
                } as any
            })
        ]);

        return { success: true, count: nightsToBlock.length };
    } catch (error: any) {
        console.error(`[iCal Sync Error] Platform: ${integration.platform}`, error);

        // Registra falha no log
        await db.syncLog.create({
            data: {
                propertyId: propertyId,
                platform: integration.platform,
                status: 'FAILED',
                errorMessage: `Erro: ${error.message}`
            } as any
        });

        throw error;
    }
}
