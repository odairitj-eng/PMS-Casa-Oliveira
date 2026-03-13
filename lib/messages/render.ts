import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RenderData {
    guest: {
        name: string;
        email: string;
        phone: string;
    };
    property: {
        name: string;
        address?: string;
        checkInStart?: string;
        checkOutEnd?: string;
        wifiName?: string;
        wifiPassword?: string;
    };
    reservation: {
        id: string;
        checkIn: Date;
        checkOut: Date;
        totalAmount: number;
        accessToken: string;
    };
}

/**
 * Renderiza uma mensagem substituindo os placeholders pelos dados reais.
 */
export function renderMessage(template: string, data: RenderData): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const guideUrl = `${baseUrl}/guide/${data.reservation.accessToken}`;

    const placeholders: Record<string, string> = {
        "{{guest_name}}": data.guest.name,
        "{{property_name}}": data.property.name,
        "{{checkin_date}}": format(new Date(data.reservation.checkIn), "dd/MM/yyyy", { locale: ptBR }),
        "{{checkout_date}}": format(new Date(data.reservation.checkOut), "dd/MM/yyyy", { locale: ptBR }),
        "{{checkin_time}}": data.property.checkInStart || "14:00",
        "{{checkout_time}}": data.property.checkOutEnd || "11:00",
        "{{reservation_id}}": data.reservation.id.slice(0, 8).toUpperCase(),
        "{{total_amount}}": new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.reservation.totalAmount),
        "{{guide_url}}": guideUrl,
        "{{wifi_name}}": data.property.wifiName || "---",
        "{{wifi_password}}": data.property.wifiPassword || "---",
        "{{property_address}}": data.property.address || "---",
    };

    let rendered = template;
    Object.entries(placeholders).forEach(([key, value]) => {
        // Escapar caracteres especiais se necessário, mas aqui usaremos replaceAll literal
        rendered = rendered.split(key).join(value);
    });

    return rendered;
}
