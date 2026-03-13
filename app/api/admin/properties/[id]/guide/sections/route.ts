import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const propertyId = params.id;
        const body = await req.json();
        const { type, title, content, imageUrl, iconName, config, sortOrder, isActive } = body;

        // Garante que o guia existe
        const guide = await (db as any).propertyGuide.findUnique({
            where: { propertyId },
        });

        if (!guide) {
            return new NextResponse("Guide not found", { status: 404 });
        }

        const section = await (db as any).guideSection.create({
            data: {
                guideId: guide.id,
                type,
                title,
                content,
                imageUrl,
                iconName,
                sortOrder: sortOrder ?? 0,
                isActive: isActive ?? true,
                config,
            },
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error("[GUIDE_SECTIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { items } = body; // Array of { id, sortOrder }

        if (!Array.isArray(items)) {
            return new NextResponse("Invalid items", { status: 400 });
        }

        // Atualização em lote de ordens
        const updates = items.map((item) =>
            (db as any).guideSection.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
            })
        );

        await (db as any).$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[GUIDE_SECTIONS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
