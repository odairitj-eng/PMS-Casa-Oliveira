import { db } from "@/lib/db";
import { addDays, addHours, addMinutes, subDays, subHours, subMinutes } from "date-fns";

/**
 * Agenda todas as mensagens automáticas aplicáveis para uma reserva específica
 */
export async function scheduleMessagesForReservation(reservationId: string) {
    const reservation = await db.reservation.findUnique({
        where: { id: reservationId },
        include: { property: true }
    });

    if (!reservation) return;

    // 1. Buscar templates automáticos ativos para este imóvel (ou globais)
    const templates = await (db as any).messageTemplate.findMany({
        where: {
            isActive: true,
            isAutomatic: true,
            OR: [
                { propertyId: reservation.propertyId },
                { propertyId: null }
            ]
        }
    });

    for (const template of templates) {
        // Verificar se já existe agendamento/log para este par reserva-template
        const existingSchedule = await (db as any).messageSchedule.findFirst({
            where: { reservationId, templateId: template.id }
        });

        const existingLog = await (db as any).messageLog.findFirst({
            where: { reservationId, templateId: template.id }
        });

        if (existingSchedule || existingLog) continue;

        // 2. Calcular data de envio
        let scheduledFor: Date | null = null;
        const offset = template.triggerOffsetValue || 0;
        const unit = template.triggerOffsetUnit;

        if (template.triggerType === "RESERVATION_CONFIRMED") {
            scheduledFor = new Date(); // Imediato
        } else if (template.triggerType === "CHECKIN_DATE") {
            // Normalmente se envia ANTES do check-in (sub)
            const baseDate = new Date(reservation.checkIn);
            if (unit === "DAYS") scheduledFor = subDays(baseDate, offset);
            else if (unit === "HOURS") scheduledFor = subHours(baseDate, offset);
            else if (unit === "MINUTES") scheduledFor = subMinutes(baseDate, offset);
        } else if (template.triggerType === "CHECKOUT_DATE") {
            const baseDate = new Date(reservation.checkOut);
            // Se offset for positivo, pode ser DEPOIS (add) ou ANTES (sub)
            // Vamos assumir que se for CHECKOUT_DATE e offset > 0, é DEPOIS (agradecimento)
            if (unit === "DAYS") scheduledFor = addDays(baseDate, offset);
            else if (unit === "HOURS") scheduledFor = addHours(baseDate, offset);
            else if (unit === "MINUTES") scheduledFor = addMinutes(baseDate, offset);
        }

        if (scheduledFor) {
            await (db as any).messageSchedule.create({
                data: {
                    templateId: template.id,
                    reservationId: reservation.id,
                    guestId: reservation.guestId,
                    scheduledFor,
                    status: "PENDING"
                }
            });
        }
    }
}

/**
 * Encontra e retorna agendamentos prontos para disparo
 */
export async function getDueSchedules() {
    return (db as any).messageSchedule.findMany({
        where: {
            status: "PENDING",
            scheduledFor: { lte: new Date() }
        },
        include: {
            template: true,
            guest: true,
            reservation: {
                include: { property: true }
            }
        }
    });
}
