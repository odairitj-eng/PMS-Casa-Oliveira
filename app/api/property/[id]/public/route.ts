import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const property = await db.property.findUnique({
            where: { id },
            select: {
                name: true,
                publicTitle: true,
                city: true,
                state: true,
                checkInStart: true,
                checkInEnd: true,
                checkOutEnd: true,
                photos: {
                    orderBy: [
                        { isPrimary: 'desc' },
                        { sortOrder: 'asc' }
                    ],
                    take: 1,
                    select: { imageUrl: true }
                }
            }
        });

        if (!property) {
            return NextResponse.json({ error: "Propriedade não encontrada" }, { status: 404 });
        }

        return NextResponse.json(property);
    } catch (error: any) {
        console.error("[PROPERTY_PUBLIC_GET]", error);
        return NextResponse.json({ error: "Erro ao buscar dados da propriedade" }, { status: 500 });
    }
}
