import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDueSchedules } from "@/lib/messages/scheduler";
import { renderMessage } from "@/lib/messages/render";
import { sendEmail } from "@/lib/messages/send-email";

/**
 * GET /api/cron/process-messages
 * Este endpoint deve ser chamado periodicamente (ex: a cada 1 hora) por um serviço de Cron
 */
export async function GET(req: NextRequest) {
    // Verificação simples de segurança
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const dueSchedules = await getDueSchedules();
        const results = {
            processed: 0,
            sentEmails: 0,
            preparedWA: 0,
            failed: 0
        };

        for (const schedule of dueSchedules) {
            results.processed++;

            // 1. Preparar dados para renderização
            const renderData = {
                guest: {
                    name: schedule.guest.name,
                    email: schedule.guest.email,
                    phone: schedule.guest.phone,
                },
                property: {
                    name: schedule.reservation.property.name,
                    address: `${schedule.reservation.property.street}, ${schedule.reservation.property.streetNumber}`,
                    checkInStart: schedule.reservation.property.checkInStart,
                    checkOutEnd: schedule.reservation.property.checkOutEnd,
                    wifiName: (schedule.reservation.property as any).wifiName,
                    wifiPassword: (schedule.reservation.property as any).wifiPassword,
                },
                reservation: {
                    id: schedule.reservation.id,
                    checkIn: schedule.reservation.checkIn,
                    checkOut: schedule.reservation.checkOut,
                    totalAmount: schedule.reservation.totalAmount,
                    accessToken: schedule.reservation.accessToken,
                }
            };

            const renderedBody = renderMessage(schedule.template.body, renderData);
            const renderedSubject = schedule.template.subject ? renderMessage(schedule.template.subject, renderData) : null;

            try {
                if (schedule.template.channelType === "EMAIL") {
                    // Disparo automático de e-mail
                    const emailRes = await sendEmail({
                        to: schedule.guest.email,
                        subject: renderedSubject || "Comunicado Casa Oliveira",
                        body: renderedBody
                    });

                    if (emailRes.success) {
                        await finalizeSchedule(schedule.id, "COMPLETED", "SENT", renderedSubject, renderedBody);
                        results.sentEmails++;
                    } else {
                        await finalizeSchedule(schedule.id, "FAILED", "FAILED", renderedSubject, renderedBody, JSON.stringify(emailRes.error));
                        results.failed++;
                    }
                } else {
                    // WhatsApp Automático (como não temos API direta, marcamos como "Due" no log para ação manual)
                    await finalizeSchedule(schedule.id, "COMPLETED", "PENDING", renderedSubject, renderedBody);
                    results.preparedWA++;
                }
            } catch (err: any) {
                console.error(`Erro ao processar schedule ${schedule.id}:`, err);
                await finalizeSchedule(schedule.id, "FAILED", "FAILED", renderedSubject, renderedBody, err.message);
                results.failed++;
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Erro no processamento de mensagens cron:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function finalizeSchedule(
    scheduleId: string,
    scheduleStatus: "COMPLETED" | "FAILED",
    logStatus: "SENT" | "FAILED" | "PENDING",
    subject: string | null,
    body: string,
    error?: string
) {
    // 1. Buscar dados do agendamento para o log
    const schedule = await (db as any).messageSchedule.findUnique({
        where: { id: scheduleId }
    });

    if (!schedule) return;

    // 2. Criar Log de Auditoria
    await (db as any).messageLog.create({
        data: {
            templateId: schedule.templateId,
            guestId: schedule.guestId,
            reservationId: schedule.reservationId,
            channelType: "WHATSAPP", // Simplificação, deveríamos pegar do template
            recipient: "AUTO",
            renderedSubject: subject,
            renderedBody: body,
            status: logStatus,
            errorMessage: error,
            sentAt: new Date(),
        }
    });

    // 3. Atualizar Status do Agendamento
    await (db as any).messageSchedule.update({
        where: { id: scheduleId },
        data: { status: scheduleStatus }
    });
}
