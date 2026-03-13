import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { renderMessage } from "@/lib/messages/render";
import { sendEmail } from "@/lib/messages/send-email";

/**
 * POST: Renderiza e prepara mensagem para envio
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { templateId, reservationId, guestId, previewOnly } = body;

        if (!templateId || !guestId) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        // 1. Buscar dados necessários
        const [template, guest, reservation] = await Promise.all([
            (db as any).messageTemplate.findUnique({ where: { id: templateId } }),
            db.guest.findUnique({ where: { id: guestId } }),
            reservationId ? db.reservation.findUnique({
                where: { id: reservationId },
                include: { property: true }
            }) : null,
        ]);

        if (!template || !guest) {
            return NextResponse.json({ error: "Template ou Hóspede não encontrado" }, { status: 404 });
        }

        // Se não houver reservationId, tentamos pegar a última reserva do hóspede
        let activeReservation = reservation;
        if (!activeReservation) {
            activeReservation = await db.reservation.findFirst({
                where: { guestId: guest.id },
                orderBy: { checkIn: "desc" },
                include: { property: true }
            }) as any;
        }

        if (!activeReservation) {
            return NextResponse.json({ error: "Nenhuma reserva encontrada para este hóspede" }, { status: 400 });
        }

        // 2. Renderizar mensagem
        const renderData: any = {
            guest: {
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
            },
            property: {
                name: activeReservation.property.name,
                address: `${activeReservation.property.street}, ${activeReservation.property.streetNumber} - ${activeReservation.property.neighborhood}`,
                checkInStart: activeReservation.property.checkInStart || undefined,
                checkOutEnd: activeReservation.property.checkOutEnd || undefined,
                wifiName: (activeReservation.property as any).wifiName,
                wifiPassword: (activeReservation.property as any).wifiPassword,
            },
            reservation: {
                id: activeReservation.id,
                checkIn: activeReservation.checkIn,
                checkOut: activeReservation.checkOut,
                totalAmount: activeReservation.totalAmount,
                accessToken: (activeReservation as any).accessToken || "",
            }
        };

        const renderedBody = renderMessage(template.body, renderData);
        const renderedSubject = template.subject ? renderMessage(template.subject, renderData) : null;

        if (previewOnly) {
            return NextResponse.json({
                renderedSubject,
                renderedBody,
                channelType: template.channelType
            });
        }

        // 3. Processar envio por canal
        let whatsappUrl = null;
        let sendStatus: any = "SENT";
        let errorLog = null;

        if (template.channelType === "WHATSAPP") {
            const cleanPhone = guest.phone.replace(/\D/g, "");
            const encodedMsg = encodeURIComponent(renderedBody);
            whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
        } else if (template.channelType === "EMAIL") {
            const emailRes = await sendEmail({
                to: guest.email,
                subject: renderedSubject || "Mensagem da Casa Oliveira",
                body: renderedBody
            });

            if (!emailRes.success) {
                sendStatus = "FAILED";
                errorLog = typeof emailRes.error === 'string' ? emailRes.error : JSON.stringify(emailRes.error);
            }
        }

        // 4. Salvar log de envio
        await (db as any).messageLog.create({
            data: {
                templateId: template.id,
                guestId: guest.id,
                reservationId: activeReservation.id,
                propertyId: activeReservation.propertyId,
                channelType: template.channelType,
                recipient: template.channelType === "EMAIL" ? guest.email : guest.phone,
                renderedSubject,
                renderedBody,
                status: sendStatus,
                errorMessage: errorLog,
                sentAt: new Date(),
                createdBy: session.user?.id || "SYSTEM"
            }
        });

        if (sendStatus === "FAILED") {
            return NextResponse.json({ error: "Falha ao disparar e-mail" }, { status: 500 });
        }

        return NextResponse.json({
            renderedSubject,
            renderedBody,
            whatsappUrl,
            channelType: template.channelType
        });

    } catch (error: any) {
        console.error("Erro no envio manual:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
