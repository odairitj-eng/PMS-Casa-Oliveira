import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

/**
 * GET: Lista todos os templates
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get("propertyId");

        const templates = await (db as any).messageTemplate.findMany({
            where: {
                propertyId: propertyId || null,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(templates);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST: Cria um novo template
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            name,
            category,
            channelType,
            subject,
            body: templateBody,
            isActive,
            isAutomatic,
            propertyId,
            triggerType,
            triggerOffsetValue,
            triggerOffsetUnit
        } = body;

        if (!name || !templateBody) {
            return NextResponse.json({ error: "Nome e conteúdo são obrigatórios" }, { status: 400 });
        }

        const template = await (db as any).messageTemplate.create({
            data: {
                name,
                category,
                channelType,
                subject,
                body: templateBody,
                isActive,
                isAutomatic,
                propertyId,
                triggerType,
                triggerOffsetValue,
                triggerOffsetUnit
            }
        });

        return NextResponse.json(template);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
