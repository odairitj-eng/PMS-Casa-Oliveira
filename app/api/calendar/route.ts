import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const reservations = await db.reservation.findMany({
            include: { guest: true }
        });

        const blockedDates = await db.blockedDate.findMany();
        const overrides = await db.nightlyOverride.findMany({
            orderBy: { date: 'asc' }
        });
        const availabilityWindows = await db.availabilityWindow.findMany({
            where: { isActive: true }
        });
        const pricingRules = await db.pricingRule.findMany({
            where: { isActive: true }
        });

        const property = await db.property.findUnique({
            where: { id: "casa-oliveira-id" }
        });

        return NextResponse.json({
            property,
            reservations,
            blockedDates,
            overrides,
            availabilityWindows,
            pricingRules
        });
    } catch (error) {
        console.error('Calendar API Error:', error);
        return NextResponse.json({ error: 'Erro ao buscar eventos do calendário' }, { status: 500 });
    }
}
