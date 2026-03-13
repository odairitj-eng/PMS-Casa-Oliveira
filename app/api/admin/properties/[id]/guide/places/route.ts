import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const propertyId = params.id;
        const body = await req.json();
        const { category, name, description, imageUrl, address, distance, googleMapsUrl, sortOrder, isActive } = body;

        // Garante que o guia existe
        const guide = await db.propertyGuide.findUnique({
            where: { propertyId },
        });

        if (!guide) {
            return new NextResponse("Guide not found", { status: 404 });
        }

        const place = await db.guidePlace.create({
            data: {
                guideId: guide.id,
                category,
                name,
                description,
                imageUrl,
                address,
                distance,
                googleMapsUrl,
                sortOrder: sortOrder ?? 0,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json(place);
    } catch (error) {
        console.error("[GUIDE_PLACES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { items } = body; // Array of { id, sortOrder }

        if (!Array.isArray(items)) {
            return new NextResponse("Invalid items", { status: 400 });
        }

        const updates = items.map((item) =>
            db.guidePlace.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
            })
        );

        await db.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[GUIDE_PLACES_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
