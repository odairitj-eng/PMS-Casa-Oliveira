import { db as defaultDb } from "./db";
import { startOfDay, addDays } from "date-fns";

export type AvailabilityStatus =
    | "CLOSED_BY_DEFAULT"
    | "OPEN"
    | "BLOCKED_CONFIRMED"
    | "BLOCKED_MANUAL"
    | "BLOCKED_EXTERNAL"
    | "HOLD";

/**
 * Resolve o status de disponibilidade para uma data específica.
 * Suporta passar uma instância de transação do Prisma.
 */
export async function getDateAvailabilityStatus(
    propertyId: string,
    date: Date,
    tx?: any
): Promise<AvailabilityStatus> {
    const client = tx || defaultDb;
    const d = startOfDay(date);

    // 1. Verificar Janelas de Abertura
    const totalWindows = await client.availabilityWindow.count({ where: { propertyId, isActive: true } });

    if (totalWindows > 0) {
        const window = await client.availabilityWindow.findFirst({
            where: {
                propertyId,
                isActive: true,
                startDate: { lte: d },
                endDate: { gte: d },
            }
        });
        if (!window) return "CLOSED_BY_DEFAULT";
    }

    // 2. Verificar se há reservas confirmadas
    const reservation = await client.reservation.findFirst({
        where: {
            propertyId,
            status: "CONFIRMED",
            checkIn: { lte: d },
            checkOut: { gt: d },
        }
    });
    if (reservation) return "BLOCKED_CONFIRMED";

    // 3. Verificar se há holds temporários ativos
    const hold = await client.reservation.findFirst({
        where: {
            propertyId,
            status: "PENDING_PAYMENT",
            holdExpiresAt: { gt: new Date() },
            checkIn: { lte: d },
            checkOut: { gt: d },
        }
    });
    if (hold) return "HOLD";

    // 4. Verificar bloqueios (Manuais ou Externos)
    const block = await client.blockedDate.findUnique({
        where: {
            propertyId_date: {
                propertyId,
                date: d,
            }
        }
    });

    if (block) {
        if (block.source === "AIRBNB" || block.source === "BOOKING") return "BLOCKED_EXTERNAL";
        if (block.source === "MANUAL" || block.source === "ADMIN") return "BLOCKED_MANUAL";
        if (block.source === "DIRECT_RESERVATION") return "HOLD"; // Reservas diretas em pending
    }

    return "OPEN";
}

export async function isDateBookable(propertyId: string, date: Date, tx?: any): Promise<boolean> {
    const status = await getDateAvailabilityStatus(propertyId, date, tx);
    return status === "OPEN";
}
