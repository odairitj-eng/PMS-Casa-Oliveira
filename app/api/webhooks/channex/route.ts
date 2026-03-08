import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfDay } from 'date-fns';

/**
 * Webhook Inbound da Channex:
 * Recebe notificações de novas reservas que ocorreram no Airbnb/Booking
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Validar Token/Chave se necessário (Channex envia via header ou params)
        const body = await req.json();

        // Exemplo de estrutura simplificada do webhook de "booking_new" da Channex
        const { payload } = body;

        if (!payload || !payload.booking) {
            return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
        }

        const { booking } = payload;
        const checkIn = startOfDay(new Date(booking.arrival_date));
        const checkOut = startOfDay(new Date(booking.departure_date));

        // Busca o imóvel pelo ID da Channex
        const property = await db.property.findUnique({
            where: { channexId: booking.property_id }
        });

        if (!property) {
            console.error(`[Webhook Channex] Imóvel com Channex ID ${booking.property_id} não encontrado.`);
            return NextResponse.json({ error: 'Imóvel não mapeado' }, { status: 404 });
        }

        const propertyId = property.id;
        console.log(`[Webhook Channex] Nova reserva externa recebida para o imóvel: ${property.name} (Local ID: ${propertyId})`);

        // 2. Salvar como Bloqueio Externo no banco de dados para evitar overbooking interno
        await db.$transaction(async (tx) => {
            const channelName = (booking.channel_name || '').toUpperCase();
            let source: any = 'CHANNEX';

            if (channelName.includes('AIRBNB')) source = 'AIRBNB';
            else if (channelName.includes('BOOKING')) source = 'BOOKING';

            let dt = new Date(checkIn);
            const datesToBlock = [];
            while (dt < checkOut) {
                datesToBlock.push({
                    propertyId,
                    date: new Date(dt),
                    source,
                    reason: `Reserva Externa (${booking.channel_name || 'OTA'}) - ID: ${booking.room_stay_id}`
                });
                dt = new Date(dt.setDate(dt.getDate() + 1));
            }

            await tx.blockedDate.createMany({
                data: datesToBlock,
                skipDuplicates: true
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Webhook Channex Error]:', error);
        return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
    }
}
