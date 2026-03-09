import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

import { reservationSchema } from "@/lib/validations/schemas";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. VALIDAÇÃO RIGOROSA COM ZOD
        const validation = reservationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Dados de reserva inválidos",
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { propertyId, checkIn, checkOut, guests, paymentMethod, email, document, name, phone } = validation.data;

        // 2. Validar propriedade e recalcular preços no SERVER-SIDE (Proteção contra adulteração)
        const property = await db.property.findUnique({
            where: { id: propertyId }
        });

        if (!property || !property.isActive) {
            return NextResponse.json({ error: "Propriedade indisponível ou inativa" }, { status: 404 });
        }

        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);

        // Proteção contra datas no passado
        if (d1 < new Date(new Date().setHours(0, 0, 0, 0))) {
            return NextResponse.json({ error: "Não é possível reservar datas no passado" }, { status: 400 });
        }

        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < (property.minimumNights || 1)) {
            return NextResponse.json({ error: `Mínimo de ${property.minimumNights || 1} noites necessário` }, { status: 400 });
        }

        // CÁLCULO SEGURO NO SERVIDOR
        const subtotal = property.basePrice * diffDays;
        const totalAmount = subtotal + property.cleaningFee;

        const externalId = uuidv4();

        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!mpAccessToken) {
            console.warn("[SECURITY] Running checkout in MOCK mode (missing MERCADOPAGO_ACCESS_TOKEN)");
            return NextResponse.json({
                success: true,
                gatewayId: "sandbox_" + Math.random().toString(36).substring(7),
                paymentMethod,
                qrCode: "00020101021243650016COM.MERCADOLIBRE020130636fb1cf200-d8ab-41dd-9cf0...sandbox_pix",
                qrCodeBase64: "",
                ticketUrl: "https://sandbox.mercadopago.com/ticket",
                externalId,
                totalAmount
            });
        }

        if (paymentMethod === 'PIX') {
            const idempotencyKey = uuidv4();
            const mpPayload = {
                transaction_amount: Number(totalAmount.toFixed(2)),
                description: `Reserva ${property.publicTitle || property.name} - Casa Oliveira`,
                payment_method_id: 'pix',
                notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
                payer: {
                    email: email,
                    first_name: name.split(' ')[0],
                    last_name: name.split(' ').slice(1).join(' ') || "Hóspede",
                    identification: {
                        type: "CPF",
                        number: document.replace(/\D/g, '')
                    }
                },
                external_reference: externalId
            };

            const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', mpPayload, {
                headers: {
                    'Authorization': `Bearer ${mpAccessToken}`,
                    'X-Idempotency-Key': idempotencyKey
                }
            });

            const data = mpResponse.data;

            return NextResponse.json({
                success: true,
                gatewayId: data.id.toString(),
                paymentMethod: 'PIX',
                qrCode: data.point_of_interaction?.transaction_data?.qr_code,
                qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
                ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
                externalId,
                totalAmount
            });
        }

        return NextResponse.json({ error: "Método não suportado" }, { status: 400 });

    } catch (error: any) {
        console.error("[SECURITY CHECKOUT ERROR]:", error.response?.data || error.message);
        return NextResponse.json({ error: "Erro ao processar pagamento de forma segura" }, { status: 500 });
    }
}
