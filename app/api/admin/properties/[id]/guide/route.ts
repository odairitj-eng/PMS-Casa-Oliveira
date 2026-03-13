import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const propertyId = params.id;

        const guide = await db.propertyGuide.findUnique({
            where: { propertyId },
            include: {
                sections: {
                    orderBy: { sortOrder: "asc" },
                },
                places: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!guide) {
            return NextResponse.json({ message: "Guide not found", guide: null });
        }

        return NextResponse.json(guide);
    } catch (error) {
        console.error("[GUIDE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

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
        const { isActive, accentColor } = body;

        const guide = await db.propertyGuide.upsert({
            where: { propertyId },
            update: {
                isActive,
                accentColor,
            },
            create: {
                propertyId,
                isActive: isActive ?? true,
                accentColor,
            },
        });

        return NextResponse.json(guide);
    } catch (error) {
        console.error("[GUIDE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
