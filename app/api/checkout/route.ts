import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { propertyId, checkIn, checkOut, guests, paymentMethod, email, document, name } = body;

        // 1. Validar propriedade e calcular total real
        const property = await db.property.findFirst();
        if (!property) return NextResponse.json({ error: "Propriedade indisponível" }, { status: 404 });

        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return NextResponse.json({ error: "Datas inválidas" }, { status: 400 });

        const totalAmount = (property.basePrice * diffDays) + property.cleaningFee;

        // 2. Criar a intenção de reserva e salvar o pagamento pendente
        // No esquema atual, adicionamos na tabela Reservation ou Payment. 
        // Como o esquema de reservations complexo pode não estar pronto, usaremos Payment tracking.
        const externalId = uuidv4(); // Referência única nossa

        // 3. Fazer chamada para o Mercado Pago (se Access Token estiver configurado)
        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!mpAccessToken) {
            // Emulação de sucesso para modo desenvolvimento / sem chaves reais adicionadas ainda
            return NextResponse.json({
                success: true,
                gatewayId: "sandbox_" + Math.random().toString(36).substring(7),
                paymentMethod,
                qrCode: "00020101021243650016COM.MERCADOLIBRE020130636fb1cf200-d8ab-41dd-9cf0...sandbox_pix",
                qrCodeBase64: "", // Sem imagem gráfica na sandbox mockada
                ticketUrl: "https://sandbox.mercadopago.com/ticket",
                externalId,
                totalAmount
            });
        }

        // Se houver chaves, tentamos criar o PIX de verdade.
        if (paymentMethod === 'PIX') {
            const idempotencyKey = uuidv4();
            const mpPayload = {
                transaction_amount: Number(totalAmount.toFixed(2)),
                description: `Reserva ${(property as any).publicTitle || property.name} (${diffDays} noites)`,
                payment_method_id: 'pix',
                payer: {
                    email: email || "test_user@sandbox.mercadopago.com",
                    first_name: name?.split(' ')[0] || "Hóspede",
                    last_name: name?.split(' ')[1] || "Teste",
                    identification: {
                        type: "CPF",
                        number: document?.replace(/\D/g, '') || "19119119100"
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

            // Salva no banco (Simulação, crie a tabela Payment atrelada à reserva se necessário)
            // Aqui você persistiria a Reserva PENDENTE + respectivo Payment row contendo external_reference

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

        return NextResponse.json({ error: "Método não suportado nesta fase inicial" }, { status: 400 });

    } catch (error: any) {
        console.error("ERRO CHECKOUT MP:", error.response?.data || error.message);
        return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
    }
}
