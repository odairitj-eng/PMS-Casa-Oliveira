import axios from 'axios';
import { db } from './db';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

const CHANNEX_API_KEY = process.env.CHANNEX_API_KEY;

/**
 * Utilitário para comunicação com a Channex.io
 */
export const channex = {
    /**
     * Envia uma atualização de disponibilidade (bloqueio) para a Channex.
     */
    async pushAvailability(propertyId: string, startDate: string, endDate: string) {
        if (!CHANNEX_API_KEY) {
            console.warn('[Channex] API Key não configurada. Sincronização ignorada.');
            return;
        }

        try {
            const property = await db.property.findUnique({
                where: { id: propertyId },
                select: { channexId: true, name: true }
            });

            if (!property?.channexId) {
                console.error(`[Channex Push] Imóvel ${propertyId} não possui channexId configurado.`);
                return;
            }

            // Gerar lista de datas entre check-in e check-out (excluindo o dia do check-out para disponibilidade real)
            const dates = eachDayOfInterval({
                start: parseISO(startDate),
                end: parseISO(endDate)
            }).map(d => format(d, 'yyyy-MM-dd'));

            console.log(`[Channex] Enviando bloqueio para ${property.name} nas datas: ${dates.join(', ')}`);

            const url = 'https://staging.channex.io/api/v1/availability'; // Sandbox

            const payload = {
                values: dates.map(date => ({
                    property_id: property.channexId,
                    date: date,
                    availability: 0 // Bloqueia a data
                }))
            };

            await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'user-api-key': CHANNEX_API_KEY
                }
            });

            console.log('[Channex] Sincronização enviada com sucesso.');
        } catch (error: any) {
            console.error('[Channex] Erro ao sincronizar disponibilidade:', error.response?.data || error.message);
        }
    }
};
