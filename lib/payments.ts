// Serviço simulado de integração com o Mercado Pago para demonstração do fluxo.

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "TEST-ACCESS-TOKEN";

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
    console.log(`[Mercado Pago] Solicitando PIX no valor de ${amount} para a reserva ${externalId}`);

    // Em produção, você faria uma chamada fetch autenticada para a API real:
    // const response = await fetch("https://api.mercadopago.com/v1/payments", {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }, ...
    // });

    // Retorno Simulado
    return {
        id: `mp_${Math.random().toString(36).substring(7)}`,
        status: "pending",
        point_of_interaction: {
            transaction_data: {
                qr_code: "00020101021243650016BR.GOV.BCB.PIX...",
                qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAA...", // mock
            }
        }
    };
}
