export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db as prisma } from "@/lib/db";
import { propertyPhotoSchema } from "@/lib/validations/schemas";

async function resolvePropertyId(propertyId?: string | null) {
    if (propertyId) return propertyId;
    const p = await prisma.property.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } });
    return p?.id;
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const propertyId = await resolvePropertyId(searchParams.get('propertyId'));
    if (!propertyId) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

    try {
        const photos = await prisma.propertyPhoto.findMany({
            where: { propertyId },
            orderBy: { sortOrder: 'asc' }
        });
        return NextResponse.json(photos);
    } catch (error: any) {
        console.error("[Photos GET Error]", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validation = propertyPhotoSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Dados inválidos", details: validation.error.flatten() }, { status: 400 });
        }

        const data = validation.data;
        const propertyId = await resolvePropertyId(data.propertyId);
        if (!propertyId) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

        if (data.id) {
            const updated = await prisma.propertyPhoto.update({
                where: { id: data.id },
                data: { imageUrl: data.imageUrl, sortOrder: data.sortOrder, isPrimary: data.isPrimary }
            });
            if (data.isPrimary) {
                await prisma.propertyPhoto.updateMany({
                    where: { propertyId, id: { not: data.id } },
                    data: { isPrimary: false }
                });
            }
            return NextResponse.json(updated);
        } else {
            const created = await prisma.propertyPhoto.create({
                data: { propertyId, imageUrl: data.imageUrl, sortOrder: data.sortOrder, isPrimary: data.isPrimary }
            });
            if (data.isPrimary) {
                await prisma.propertyPhoto.updateMany({
                    where: { propertyId, id: { not: created.id } },
                    data: { isPrimary: false }
                });
            }
            return NextResponse.json(created);
        }
    } catch (error: any) {
        console.error("[Photos POST Error]", error);
        return NextResponse.json({ error: "Erro interno ao salvar foto" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
        await prisma.propertyPhoto.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
