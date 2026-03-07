import { db } from './db';
import { isWeekend, differenceInDays, startOfDay } from 'date-fns';

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
}

/**
 * Calcula o preço inteligente para uma estadia.
 */
export async function calculateSmartPrice(
    propertyId: string,
    checkIn: Date,
    checkOut: Date
): Promise<PricingResult> {
    const property = await db.property.findUnique({
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

    const nights = differenceInDays(checkOut, checkIn);
    const breakdown = [];
    let totalNightsPrice = 0;

    for (let i = 0; i < nights; i++) {
        const currentDate = new Date(checkIn);
        currentDate.setDate(currentDate.getDate() + i);
        const dateOnly = startOfDay(currentDate);

        let finalPrice = property.basePrice;
        const appliedRules: string[] = [];

        // 1. Verificar Overrides Manuais (Prioridade Máxima)
        const override = property.nightlyOverrides.find(
            (o: any) => o.date.getTime() === dateOnly.getTime()
        );

        if (override) {
            finalPrice = override.price;
            appliedRules.push('Ajuste Manual');
        } else {
            // 2. Aplicar Regras Automáticas
            const now = startOfDay(new Date());
            for (const rule of property.pricingRules) {
                // Aumento de Fim de Semana
                if (rule.type === 'WEEKEND_SURGE' && isWeekend(dateOnly)) {
                    finalPrice *= rule.value;
                    appliedRules.push(`Fim de Semana (+${Math.round((rule.value - 1) * 100)}%)`);
                }

                // Reserva de Última Hora (Dinâmico)
                if (rule.type === 'LAST_MINUTE') {
                    const daysToCheckIn = differenceInDays(startOfDay(checkIn), now);
                    const threshold = rule.minDays || 7;
                    if (daysToCheckIn <= threshold) {
                        finalPrice *= rule.value;
                        appliedRules.push(`Última Hora (<= ${threshold} dias)`);
                    }
                }

                // Reserva Antecipada (Early Bird)
                if (rule.type === 'EARLY_BIRD') {
                    const daysToCheckIn = differenceInDays(startOfDay(checkIn), now);
                    const threshold = rule.minDays || 30;
                    if (daysToCheckIn >= threshold) {
                        finalPrice *= rule.value;
                        appliedRules.push(`Antecipada (>= ${threshold} dias)`);
                    }
                }

                // Sazonalidade (Datas Específicas)
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

        breakdown.push({
            date: dateOnly,
            originalPrice: property.basePrice,
            finalPrice: Math.round(finalPrice),
            appliedRules,
        });

        totalNightsPrice += finalPrice;
    }

    return {
        total: Math.round(totalNightsPrice + property.cleaningFee),
        breakdown,
        basePrice: property.basePrice,
        cleaningFee: property.cleaningFee,
    };
}
