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
        // ─── Receita total (últimos 30 dias, reservas confirmadas) ───────────
        const revenueAgg = await db.reservation.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: 'CONFIRMED',
                createdAt: { gte: thirtyDaysAgo },
            },
        });
        const revenueTotal = revenueAgg._sum.totalAmount ?? 0;

        // ─── Receita mês anterior (comparativo) ─────────────────────────────
        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(now.getDate() - 60);
        const revenuePrevAgg = await db.reservation.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: 'CONFIRMED',
                createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
        });
        const revenuePrev = revenuePrevAgg._sum.totalAmount ?? 0;
        const revenueGrowth = revenuePrev > 0
            ? Math.round(((revenueTotal - revenuePrev) / revenuePrev) * 100)
            : null;

        // ─── Taxa de ocupação (próximos 30 dias) ────────────────────────────
        const property = await db.property.findFirst({ select: { minimumNights: true } });
        const blockedDates = await db.blockedDate.count({
            where: {
                date: { gte: now, lte: thirtyDaysFromNow },
            },
        });
        const occupancyRate = Math.round((blockedDates / 30) * 100);
        const availableNights = 30 - blockedDates;

        // ─── Diária Média ADR (últimos 30 dias) ─────────────────────────────
        const adrAgg = await db.reservation.aggregate({
            _avg: { nightlyRate: true },
            where: {
                status: 'CONFIRMED',
                createdAt: { gte: thirtyDaysAgo },
            },
        });
        const adr = adrAgg._avg.nightlyRate ?? 0;
        const basePrice = await db.property.findFirst({ select: { basePrice: true } });

        // ─── Novos hóspedes (últimos 30 dias) ───────────────────────────────
        const newGuests = await db.guest.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        });
        const newVips = await db.guest.count({
            where: { createdAt: { gte: thirtyDaysAgo }, isVip: true },
        });

        // ─── Próximas chegadas (hoje e próximos 7 dias) ──────────────────────
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const upcomingArrivals = await db.reservation.findMany({
            where: {
                status: 'CONFIRMED',
                checkIn: { gte: todayStart, lte: nextWeek },
            },
            include: {
                guest: { select: { name: true, email: true, isVip: true } },
            },
            orderBy: { checkIn: 'asc' },
            take: 10,
        });

        // ─── Avisos do sistema ───────────────────────────────────────────────
        const pendingReservations = await db.reservation.findMany({
            where: {
                status: 'PENDING_PAYMENT',
                holdExpiresAt: { gte: now },
            },
            select: { id: true, holdExpiresAt: true, guest: { select: { name: true } } },
            orderBy: { holdExpiresAt: 'asc' },
            take: 5,
        }).catch(err => {
            console.error('[Dashboard API] Error fetching pending reservations:', err.message);
            return [];
        });

        // SyncLog model doesn't exist in local/neon schema right now
        const lastSyncs: any[] = [];


        return NextResponse.json({
            stats: {
                revenueTotal,
                revenueGrowth,
                occupancyRate,
                availableNights,
                adr: Math.round(adr),
                basePrice: basePrice?.basePrice ?? 0,
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
