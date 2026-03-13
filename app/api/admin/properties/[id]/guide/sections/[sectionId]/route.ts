import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string, sectionId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const sectionId = params.sectionId;
        const body = await req.json();

        // Removemos campos que não devem ser editados via este endpoint se necessário
        const { id, guideId, createdAt, updatedAt, ...updateData } = body;

        const section = await db.guideSection.update({
            where: { id: sectionId },
            data: updateData,
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error("[GUIDE_SECTION_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string, sectionId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const sectionId = params.sectionId;

        await db.guideSection.delete({
            where: { id: sectionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[GUIDE_SECTION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
