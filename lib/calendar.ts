import { db } from './db';

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
