import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

/**
 * Simples Rate Limiter em memória.
 * Nota: Em produção serverless real (Vercel), a memória não é compartilhada entre lambdas.
 * Para um rate limit robusto em produção, recomenda-se Upstash Redis.
 */
export async function rateLimit(
    req: NextRequest,
    limit: number = 10,
    windowMs: number = 60 * 1000
) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();

    if (!store[ip] || now > store[ip].resetTime) {
        store[ip] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return { success: true, remaining: limit - 1 };
    }

    store[ip].count++;

    if (store[ip].count > limit) {
        return { success: false, remaining: 0 };
    }

    return { success: true, remaining: limit - store[ip].count };
}

export function rateLimitResponse() {
    return NextResponse.json(
        { error: "Muitas solicitações. Tente novamente mais tarde." },
        { status: 429 }
    );
}
