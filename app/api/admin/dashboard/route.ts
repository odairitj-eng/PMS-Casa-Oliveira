export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    try {
        // ─── Executando TODAS as consultas em paralelo para máxima performance ────
        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(now.getDate() - 60);

        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const [
            revenueAgg,
            revenuePrevAgg,
            propertyBase,
            blockedDatesCount,
            adrAgg,
            newGuestsCount,
            newVipsCount,
            upcomingArrivalsList,
            pendingReservationsList
        ] = await Promise.all([
            // 1. Receita total (últimos 30 dias)
            db.reservation.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'CONFIRMED', createdAt: { gte: thirtyDaysAgo } },
            }),
            // 2. Receita mês anterior (comparativo 60-30 dias)
            db.reservation.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'CONFIRMED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            }),
            // 3. Informações base da propriedade
            db.property.findFirst({ select: { minimumNights: true, basePrice: true } }),
            // 4. Datas bloqueadas
            db.blockedDate.count({
                where: { date: { gte: now, lte: thirtyDaysFromNow } },
            }),
            // 5. ADR (Diária média)
            db.reservation.aggregate({
                _avg: { nightlyRate: true },
                where: { status: 'CONFIRMED', createdAt: { gte: thirtyDaysAgo } },
            }),
            // 6. Novos Hóspedes
            db.guest.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            // 7. Novos VIPs
            db.guest.count({ where: { createdAt: { gte: thirtyDaysAgo }, isVip: true } }),
            // 8. Chegadas
            db.reservation.findMany({
                where: { status: 'CONFIRMED', checkIn: { gte: todayStart, lte: nextWeek } },
                include: { guest: { select: { name: true, email: true, isVip: true } } },
                orderBy: { checkIn: 'asc' },
                take: 10,
            }),
            // 9. Avisos (Pagamentos pendentes)
            db.reservation.findMany({
                where: { status: 'PENDING_PAYMENT', holdExpiresAt: { gte: now } },
                select: { id: true, holdExpiresAt: true, guest: { select: { name: true } } },
                orderBy: { holdExpiresAt: 'asc' },
                take: 5,
            })
        ]);

        const revenueTotal = revenueAgg._sum.totalAmount ?? 0;
        const revenuePrev = revenuePrevAgg._sum.totalAmount ?? 0;
        const revenueGrowth = revenuePrev > 0
            ? Math.round(((revenueTotal - revenuePrev) / revenuePrev) * 100)
            : null;

        const occupancyRate = Math.round((blockedDatesCount / 30) * 100);
        const availableNights = 30 - blockedDatesCount;

        const adr = adrAgg._avg.nightlyRate ?? 0;
        const basePriceValue = propertyBase?.basePrice ?? 0;

        const upcomingArrivals = upcomingArrivalsList;
        const pendingReservations = pendingReservationsList;
        const newGuests = newGuestsCount;
        const newVips = newVipsCount;
        const lastSyncs: any[] = [];


        return NextResponse.json({
            stats: {
                revenueTotal,
                revenueGrowth,
                occupancyRate,
                availableNights,
                adr: Math.round(adr),
                basePrice: basePriceValue,
                newGuests,
                newVips,
            },
            upcomingArrivals,
            pendingReservations,
            lastSyncs,
        });
    } catch (error: any) {
        console.error('[Dashboard API Error] Message:', error.message);
        console.error('[Dashboard API Error] Code:', error.code);
        console.error('[Dashboard API Error] Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
        return NextResponse.json({ error: 'Erro ao buscar dados do dashboard.', detail: error.message }, { status: 500 });
    }
}
