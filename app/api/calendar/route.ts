import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const reservations = await db.reservation.findMany({
            where: { propertyId },
            include: { guest: true }
        });

        const blockedDates = await db.blockedDate.findMany({
            where: { propertyId }
        });
        const overrides = await db.nightlyOverride.findMany({
            where: { propertyId },
            orderBy: { date: 'asc' }
        });
        const availabilityWindows = await db.availabilityWindow.findMany({
            where: { propertyId, isActive: true }
        });
        const pricingRules = await db.pricingRule.findMany({
            where: { propertyId, isActive: true }
        });

        const property = await db.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            return NextResponse.json({
                property: null,
                reservations: [],
                blockedDates: [],
                overrides: [],
                availabilityWindows: [],
                pricingRules: []
            });
        }

        return NextResponse.json({
            property,
            reservations,
            blockedDates,
            overrides,
            availabilityWindows,
            pricingRules
        });
    } catch (error: any) {
        console.error('Calendar API Error:', error);
        return NextResponse.json({
            error: 'Erro ao buscar eventos do calendário',
            detail: error.message,
            property: null,
            reservations: []
        }, { status: 500 });
    }
}
