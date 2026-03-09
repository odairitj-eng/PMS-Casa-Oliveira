export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db as prisma } from "@/lib/db";
import { propertyAmenitySchema } from "@/lib/validations/schemas";

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
        const amenities = await prisma.propertyAmenity.findMany({
            where: { propertyId },
            orderBy: { sortOrder: 'asc' }
        });
        return NextResponse.json(amenities);
    } catch (error: any) {
        console.error("[Amenities GET Error]", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validation = propertyAmenitySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Dados inválidos", details: validation.error.flatten() }, { status: 400 });
        }

        const data = validation.data;
        const propertyId = await resolvePropertyId(data.propertyId);
        if (!propertyId) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

        if (data.id) {
            const updated = await prisma.propertyAmenity.update({
                where: { id: data.id },
                data: {
                    amenityKey: data.amenityKey,
                    amenityName: data.amenityName,
                    iconName: data.iconName,
                    sortOrder: data.sortOrder,
                    isActive: data.isActive
                }
            });
            return NextResponse.json(updated);
        } else {
            const created = await prisma.propertyAmenity.create({
                data: {
                    propertyId,
                    amenityKey: data.amenityKey,
                    amenityName: data.amenityName,
                    iconName: data.iconName,
                    sortOrder: data.sortOrder,
                    isActive: data.isActive
                }
            });
            return NextResponse.json(created);
        }
    } catch (error: any) {
        console.error("[Amenities POST Error]", error);
        return NextResponse.json({ error: "Erro interno ao salvar facilidade" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
        await prisma.propertyAmenity.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
