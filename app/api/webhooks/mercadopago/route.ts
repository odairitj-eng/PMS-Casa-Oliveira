import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const limiter = await rateLimit(req, 100, 60000); // Mais folgado para webhooks
        if (!limiter.success) return rateLimitResponse();

        const body = await req.json();
        const url = req.nextUrl;

        // 1. VALIDAÇÃO DE ASSINATURA (SECURITY HARDENING)
        // O Mercado Pago envia x-signature para validar que a notificação é legítima
        const xSignature = req.headers.get('x-signature');
        const xRequestId = req.headers.get('x-request-id');
        const mpWebhookSecret = process.env.MP_WEBHOOK_SECRET;

        // ID do evento (Notificação)
        const eventId = body.id?.toString() || body.data?.id?.toString();

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
                const manifest = `id:${eventId};request-id:${xRequestId};ts:${ts};`;
                const hmac = crypto.createHmac('sha256', mpWebhookSecret);
                hmac.update(manifest);
                const checkHash = hmac.digest('hex');

                if (checkHash !== hash) {
                    console.error('[SECURITY ALERT] Invalid Webhook Signature detected!');
                    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
                }
            }
        } else if (process.env.NODE_ENV === 'production') {
            console.error('[SECURITY CRITICAL] Webhook received without signature in production! REJECTED.');
            return NextResponse.json({ error: 'Signature required' }, { status: 401 });
        }

        const id = body.data?.id || body.id;
        const topic = body.type || body.topic;

        if (topic !== 'payment' || !id) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // 2. IDEMPOTÊNCIA (PREVENÇÃO DE REPLAY ATTACK)
        // Verificamos se este evento já foi processado
        const existingEvent = await db.processedEvent.findUnique({
            where: { id: eventId }
        });

        if (existingEvent) {
            console.log(`[Webhook] Event ${eventId} already processed. Skipping.`);
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // 3. BUSCAR STATUS REAL NA API DO MP (NÃO CONFIAR NO BODY DO WEBHOOK)
        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!mpAccessToken) {
            console.error('[WEBHOOK ERROR] Missing MP Access Token');
            return NextResponse.json({ error: 'Config error' }, { status: 500 });
        }

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
                await db.$transaction([
                    db.payment.update({
                        where: { id: paymentRecord.id },
                        data: { status: 'APPROVED' }
                    }),
                    db.reservation.update({
                        where: { id: paymentRecord.reservationId },
                        data: { status: 'CONFIRMED' }
                    }),
                    // Registrar que o evento foi processado
                    db.processedEvent.create({
                        data: { id: eventId, provider: 'MERCADO_PAGO' }
                    })
                ]);
                console.log(`[Webhook] Payment ${id} APPROVED. Reservation ${paymentRecord.reservationId} confirmed.`);
            }
        } else {
            // Mesmo que não seja aprovado, marcamos como processado para evitar re-análise desnecessária
            // se o status for final (ex: rejected)
            if (['rejected', 'cancelled', 'refunded'].includes(status)) {
                await db.processedEvent.create({
                    data: { id: eventId, provider: 'MERCADO_PAGO' }
                }).catch(() => { }); // Ignora erro se já existir
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error('[Webhook Error]:', error.message);
        return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
    }
}
