import { db } from './db';
import { isWeekend, differenceInDays, startOfDay, eachDayOfInterval } from 'date-fns';

export interface PricingResult {
    total: number;
    breakdown: Array<{
        date: Date;
        originalPrice: number;
        finalPrice: number;
        appliedRules: string[];
    }>;
    basePrice: number;
    cleaningFee: number;
    totalNights: number;
    nightlyRate: number;
}

/**
 * Calcula o preço inteligente para uma estadia no servidor.
 * Proteção contra Price Tampering.
 */
export async function calculateSmartPrice(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
    tx?: any
): Promise<PricingResult> {
    const client = tx || db;

    const property = await client.property.findUnique({
        where: { id: propertyId },
        include: {
            pricingRules: { where: { isActive: true } },
            nightlyOverrides: {
                where: {
                    date: {
                        gte: startOfDay(checkIn),
                        lt: startOfDay(checkOut),
                    },
                },
            },
        },
    });

    if (!property) throw new Error('Propriedade não encontrada.');

    const dIn = startOfDay(checkIn);
    const dOut = startOfDay(checkOut);
    const nights = differenceInDays(dOut, dIn);

    if (nights <= 0) throw new Error('Datas de check-in e check-out inválidas.');
    if (nights < (property.minimumNights || 1)) {
        throw new Error(`O mínimo de noites para este imóvel é ${property.minimumNights}.`);
    }

    const interval = eachDayOfInterval({
        start: dIn,
        end: new Date(dOut.getTime() - 1000)
    });

    const breakdown = [];
    let totalNightsPrice = 0;
    const now = startOfDay(new Date());

    for (const dateOnly of interval) {
        let finalPrice = property.basePrice;
        const appliedRules: string[] = [];

        // 1. Verificar Overrides Manuais (Prioridade Máxima)
        const override = property.nightlyOverrides.find(
            (o: any) => startOfDay(o.date).getTime() === dateOnly.getTime()
        );

        if (override) {
            finalPrice = override.price;
            appliedRules.push('Ajuste Manual');
        } else {
            // 2. Aplicar Regras Automáticas
            for (const rule of property.pricingRules) {
                // Aumento de Fim de Semana
                if (rule.type === 'WEEKEND_SURGE' && isWeekend(dateOnly)) {
                    finalPrice *= rule.value;
                    appliedRules.push(`Fim de Semana (+${Math.round((rule.value - 1) * 100)}%)`);
                }

                // Reserva de Última Hora
                if (rule.type === 'LAST_MINUTE') {
                    const daysToCheckIn = differenceInDays(dIn, now);
                    const threshold = rule.minDays || 7;
                    if (daysToCheckIn <= threshold) {
                        finalPrice *= rule.value;
                        appliedRules.push(`Última Hora (<= ${threshold} dias)`);
                    }
                }

                // Reserva Antecipada (Early Bird)
                if (rule.type === 'EARLY_BIRD') {
                    const daysToCheckIn = differenceInDays(dIn, now);
                    const threshold = rule.minDays || 30;
                    if (daysToCheckIn >= threshold) {
                        finalPrice *= rule.value;
                        appliedRules.push(`Antecipada (>= ${threshold} dias)`);
                    }
                }

                // Sazonalidade
                if (rule.type === 'SEASONAL' && rule.startDate && rule.endDate) {
                    const s = startOfDay(new Date(rule.startDate));
                    const e = startOfDay(new Date(rule.endDate));
                    if (dateOnly >= s && dateOnly <= e) {
                        finalPrice *= rule.value;
                        appliedRules.push(rule.description || 'Ajuste Sazonal');
                    }
                }
            }
        }

        const roundedPrice = Number(finalPrice.toFixed(2));
        breakdown.push({
            date: dateOnly,
            originalPrice: property.basePrice,
            finalPrice: roundedPrice,
            appliedRules,
        });

        totalNightsPrice += roundedPrice;
    }

    const total = Number((totalNightsPrice + property.cleaningFee).toFixed(2));

    return {
        total,
        breakdown,
        basePrice: property.basePrice,
        cleaningFee: property.cleaningFee,
        totalNights: nights,
        nightlyRate: Number((totalNightsPrice / nights).toFixed(2))
    };
}
