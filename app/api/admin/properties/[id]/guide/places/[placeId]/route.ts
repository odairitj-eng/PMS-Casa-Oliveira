import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string, placeId: string } }
) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const placeId = params.placeId;
        const body = await req.json();

        const updatedPlace = await (db as any).guidePlace.update({
            where: { id: placeId },
            data: body,
        });

        return NextResponse.json(updatedPlace);
    } catch (error) {
        console.error("[PLACE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; placeId: string } }
) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const placeId = params.placeId;

        await (db as any).guidePlace.delete({
            where: { id: placeId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[PLACE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
