import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string, placeId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const placeId = params.placeId;
        const body = await req.json();

        const { id, guideId, createdAt, updatedAt, ...updateData } = body;

        const place = await db.guidePlace.update({
            where: { id: placeId },
            data: updateData,
        });

        return NextResponse.json(place);
    } catch (error) {
        console.error("[GUIDE_PLACE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string, placeId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const placeId = params.placeId;

        await db.guidePlace.delete({
            where: { id: placeId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[GUIDE_PLACE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
