import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function createPixPayment({
    amount,
    description,
    email,
    externalId,
}: {
    amount: number;
    description: string;
    email: string;
    externalId: string;
}) {
    if (!MP_ACCESS_TOKEN) {
        console.warn("[SECURITY] Running Pix in MOCK mode (missing MERCADOPAGO_ACCESS_TOKEN)");
        return {
            id: `mock_${uuidv4().substring(0, 8)}`,
            point_of_interaction: {
                transaction_data: {
                    qr_code: "00020101021243650016BR.GOV.BCB.PIX...",
                    qr_code_base64: ""
                }
            }
        };
    }

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.setMinutes(0) + 30); // 30 minutos de validade

    const payload = {
        transaction_amount: Number(amount.toFixed(2)),
        description: description,
        payment_method_id: "pix",
        external_reference: externalId,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        payer: {
            email: email,
        },
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`
    };

    const response = await axios.post("https://api.mercadopago.com/v1/payments", payload, {
        headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
            "X-Idempotency-Key": uuidv4(),
        },
    });

    return response.data;
}

/**
 * Cria uma preferência de checkout para redirecionamento (Checkout Pro).
 * Maneira mais segura (PCI-Safer) pois o usuário paga no ambiente do Mercado Pago.
 */
export async function createCheckoutPreference({
    amount,
    description,
    externalId,
    email
}: {
    amount: number;
    description: string;
    externalId: string;
    email: string;
}) {
    if (!MP_ACCESS_TOKEN) {
        return { init_point: `${process.env.NEXTAUTH_URL}/mock-payment?id=${externalId}` };
    }

    const payload = {
        items: [
            {
                id: externalId,
                title: description,
                quantity: 1,
                unit_price: Number(amount.toFixed(2)),
                currency_id: "BRL"
            }
        ],
        payer: {
            email: email
        },
        external_reference: externalId,
        back_urls: {
            success: `${process.env.NEXTAUTH_URL}/profile`,
            pending: `${process.env.NEXTAUTH_URL}/profile`,
            failure: `${process.env.NEXTAUTH_URL}/checkout`
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora de validade
    };

    const response = await axios.post("https://api.mercadopago.com/checkout/preferences", payload, {
        headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
    });

    return response.data;
}

/**
 * Realiza o reembolso de um pagamento no Mercado Pago.
 * Suporta Pix e Cartão de Crédito.
 */
export async function refundPayment({
    paymentId,
    amount,
}: {
    paymentId: string;
    amount?: number; // Se não enviado, reembolsa o total
}) {
    if (!MP_ACCESS_TOKEN) {
        console.warn("[SECURITY] Running Refund in MOCK mode (missing MERCADOPAGO_ACCESS_TOKEN)");
        return {
            id: `mock_refund_${uuidv4().substring(0, 8)}`,
            status: "approved",
            amount: amount || 0
        };
    }

    const payload = amount ? { amount: Number(amount.toFixed(2)) } : {};

    try {
        const response = await axios.post(
            `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
                    "X-Idempotency-Key": uuidv4(),
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Error refunding payment:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Erro ao processar reembolso no Mercado Pago");
    }
}
