export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

/**
 * Guest Statistics Recalibrator (Admin)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    try {
        const userId = params.id;

        const reservations = await db.reservation.findMany({
            where: { guestId: userId },
            orderBy: { checkIn: 'desc' }
        });

        if (reservations.length === 0) {
            await db.guest.update({
                where: { id: userId },
                data: {
                    totalBookings: 0,
                    // @ts-ignore
                    completedStays: 0,
                    totalRevenueGenerated: 0,
                    lastReservationAt: null,
                    lastStayAt: null
                }
            });
            return NextResponse.json({ success: true, message: 'Hóspede sem reservas.' });
        }

        const stats = reservations.reduce((acc, res) => {
            acc.totalBookings += 1;
            if (res.status === 'CONFIRMED') {
                acc.totalRevenue += res.totalAmount;
                if (new Date(res.checkOut) < new Date()) {
                    acc.completedStays += 1;
                }
            }
            return acc;
        }, { totalBookings: 0, completedStays: 0, totalRevenue: 0 });

        const lastReservation = reservations[0];
        const lastStay = reservations.find(r => r.status === 'CONFIRMED' && new Date(r.checkOut) < new Date());

        const updatedGuest = await db.guest.update({
            where: { id: userId },
            data: {
                totalBookings: stats.totalBookings,
                // @ts-ignore
                completedStays: stats.completedStays,
                totalRevenueGenerated: stats.totalRevenue,
                lastReservationAt: lastReservation.createdAt,
                lastStayAt: lastStay ? lastStay.checkOut : null
            }
        });

        return NextResponse.json({ success: true, guest: updatedGuest });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao recalcular estatísticas.' }, { status: 500 });
    }
}
