import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
        return NextResponse.json({ error: "propertyId é obrigatório" }, { status: 400 });
    }

    try {
        const integrations = await db.integration.findMany({
            where: { propertyId },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(integrations);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar integrações" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { propertyId, platform, icalUrl } = body;

        if (!propertyId || !platform || !icalUrl) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
        }

        const integration = await db.integration.create({
            data: {
                propertyId,
                platform,
                icalUrl
            }
        });

        return NextResponse.json(integration);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar integração" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    try {
        await db.integration.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao deletar integração" }, { status: 500 });
    }
}
