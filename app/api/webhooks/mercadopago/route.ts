import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const url = req.nextUrl;
        const id = url.searchParams.get('id');
        const topic = url.searchParams.get('topic');

        if (topic !== 'payment' || !id) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Em produção: Buscar o status real do pagamento na API do MP usando este ID
        // const paymentInfo = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, ...)

        // Simulação: assumindo que a notificação significa APPROVED
        const simulatedStatus = "approved";

        if (simulatedStatus === "approved") {
            // 1. Achar nosso payment via gatewayTransactionId
            const paymentRecord = await db.payment.findFirst({
                where: { gatewayTransactionId: { endsWith: id } }, // Lógica genérica de mock
                include: { reservation: true }
            });

            if (paymentRecord && paymentRecord.status !== 'APPROVED') {
                // 2. Atualizar transação e reserva
                await db.$transaction([
                    db.payment.update({
                        where: { id: paymentRecord.id },
                        data: { status: 'APPROVED' }
                    }),
                    db.reservation.update({
                        where: { id: paymentRecord.reservationId },
                        data: { status: 'CONFIRMED' } // Reserva está 100% garantida
                    })
                ]);

                // 3. Aqui enviaríamos e-mail de confirmação usando Resend/SendGrid
                console.log(`[Webhook] Reserva ${paymentRecord.reservationId} confirmada via PIX!`);
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
    }
}
