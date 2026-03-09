import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const url = req.nextUrl;

        // 1. VALIDAÇÃO DE ASSINATURA (SECURITY HARDENING)
        // O Mercado Pago envia x-signature para validar que a notificação é legítima
        const xSignature = req.headers.get('x-signature');
        const xRequestId = req.headers.get('x-request-id');
        const mpWebhookSecret = process.env.MP_WEBHOOK_SECRET;

        if (mpWebhookSecret && xSignature) {
            const parts = xSignature.split(',');
            let ts: string | undefined;
            let hash: string | undefined;

            parts.forEach(p => {
                const [key, value] = p.split('=');
                if (key.trim() === 'ts') ts = value;
                if (key.trim() === 'v1') hash = value;
            });

            if (ts && hash) {
                const manifest = `id:${body.data?.id || body.id};request-id:${xRequestId};ts:${ts};`;
                const hmac = crypto.createHmac('sha256', mpWebhookSecret);
                hmac.update(manifest);
                const checkHash = hmac.digest('hex');

                if (checkHash !== hash) {
                    console.error('[SECURITY ALERT] Invalid Webhook Signature detected!');
                    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
                }
            }
        } else if (process.env.NODE_ENV === 'production') {
            console.warn('[SECURITY] Webhook received without signature in production!');
            // Em cenários de hardening extremo, poderíamos rejeitar aqui.
        }

        const id = body.data?.id || body.id;
        const topic = body.type || body.topic;

        if (topic !== 'payment' || !id) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // 2. BUSCAR STATUS REAL NA API DO MP (NÃO CONFIAR NO BODY DO WEBHOOK)
        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!mpAccessToken) {
            console.error('[WEBHOOK ERROR] Missing MP Access Token for status verification');
            return NextResponse.json({ error: 'Config error' }, { status: 500 });
        }

        // Fazemos um fetch para a API do MP para confirmar que o pagamento realmente existe e está aprovado
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: { 'Authorization': `Bearer ${mpAccessToken}` }
        });

        if (!mpRes.ok) {
            console.error('[WEBHOOK ERROR] Failed to verify payment with MP API');
            return NextResponse.json({ error: 'Failed to verify' }, { status: 502 });
        }

        const paymentData = await mpRes.json();
        const status = paymentData.status;

        if (status === "approved") {
            // Achar o registro de pagamento no nosso banco usando o ID do MP
            const paymentRecord = await db.payment.findFirst({
                where: {
                    OR: [
                        { gatewayTransactionId: id.toString() },
                        { gatewayTransactionId: { endsWith: id.toString() } }
                    ]
                },
                include: { reservation: true }
            });

            if (paymentRecord && paymentRecord.status !== 'APPROVED') {
                // Atualização atômica: aprova pagamento e confirma reserva
                await db.$transaction([
                    db.payment.update({
                        where: { id: paymentRecord.id },
                        data: { status: 'APPROVED' }
                    }),
                    db.reservation.update({
                        where: { id: paymentRecord.reservationId },
                        data: { status: 'CONFIRMED' }
                    })
                ]);
                console.log(`[Webhook] Payment ${id} APPROVED. Reservation ${paymentRecord.reservationId} confirmed.`);
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error('[Webhook Error]:', error.message);
        return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
    }
}
