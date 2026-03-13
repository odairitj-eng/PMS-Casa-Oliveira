import { CancellationPolicy, ReservationStatus } from "@prisma/client";
import { differenceInHours } from "date-fns";

export interface RefundCalculation {
    refundAmount: number;
    refundPercentage: number;
    policyApplied: string;
    canCancel: boolean;
    error?: string;
}

/**
 * Calcula o valor do reembolso baseado na política de cancelamento da propriedade
 * e na antecedência em relação ao check-in.
 */
export function calculateRefundAmount(
    checkInDate: Date,
    totalPaid: number,
    policy?: CancellationPolicy | null
): RefundCalculation {
    const now = new Date();
    const hoursUntilCheckIn = differenceInHours(checkInDate, now);

    // Se não houver política, assume-se NÃO REEMBOLSÁVEL por segurança
    if (!policy) {
        return {
            refundAmount: 0,
            refundPercentage: 0,
            policyApplied: "Nenhuma política definida",
            canCancel: true
        };
    }

    // 1. Cancelamento Gratuito (Reembolso Total)
    if (hoursUntilCheckIn >= policy.cancelFreeLimitHours) {
        return {
            refundAmount: totalPaid,
            refundPercentage: 100,
            policyApplied: policy.name,
            canCancel: true
        };
    }

    // 2. Reembolso Parcial
    if (hoursUntilCheckIn >= policy.nonRefundableLimitHours) {
        const refundAmount = totalPaid * (policy.partialRefundPercentage / 100);
        return {
            refundAmount: Number(refundAmount.toFixed(2)),
            refundPercentage: policy.partialRefundPercentage,
            policyApplied: policy.name,
            canCancel: true
        };
    }

    // 3. Não Reembolsável
    return {
        refundAmount: 0,
        refundPercentage: 0,
        policyApplied: policy.name,
        canCancel: true
    };
}

/**
 * Valida se uma reserva pode ser cancelada de acordo com seu status atual.
 */
export function canReservationBeCancelled(status: ReservationStatus): boolean {
    const allowedStatuses: ReservationStatus[] = [
        "PENDING_PAYMENT",
        "CONFIRMED"
    ];

    return allowedStatuses.includes(status);
}

/**
 * Define o novo status da reserva após o cancelamento.
 */
export function getNewStatusAfterCancellation(
    cancelledBy: "GUEST" | "HOST" | "SYSTEM"
): ReservationStatus {
    switch (cancelledBy) {
        case "GUEST": return "CANCELLED_BY_GUEST";
        case "HOST": return "CANCELLED_BY_HOST";
        case "SYSTEM": return "CANCELLED_SYSTEM";
        default: return "CANCELLED_SYSTEM";
    }
}

/**
 * Gera um código único para o cupom de crédito.
 * Formato: CO-XXXX-YYYY (Casa Oliveira - Aleatório - Timestamp)
 */
export function generateCreditCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const timestampPart = Date.now().toString(36).toUpperCase().slice(-4);
    return `CO-${randomPart}-${timestampPart}`;
}
