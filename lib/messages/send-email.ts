import { Resend } from "resend";

let resend: any = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    from?: string;
}

/**
 * Envia um e-mail utilizando o Resend
 */
export async function sendEmail({ to, subject, body, from }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY não configurada. E-mail não enviado.");
        return { success: false, error: "API Key missing" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from || "Casa Oliveira <reservas@casaoliveira.com.br>", // Idealmente usar domínio verificado
            to: [to],
            subject: subject,
            html: body.replace(/\n/g, "<br>"), // Conversão simples para HTML
        });

        if (error) {
            console.error("Erro Resend:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Erro fatal envio e-mail:", error);
        return { success: false, error };
    }
}
