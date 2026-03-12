export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { name, cancelFreeLimitHours, partialRefundPercentage, nonRefundableLimitHours, description } = body;

        // Upsert na política de cancelamento
        const policy = await db.cancellationPolicy.upsert({
            where: { propertyId: id },
            update: {
                name,
                cancelFreeLimitHours: parseInt(cancelFreeLimitHours),
                partialRefundPercentage: parseInt(partialRefundPercentage),
                nonRefundableLimitHours: parseInt(nonRefundableLimitHours),
                description
            },
            create: {
                propertyId: id,
                name,
                cancelFreeLimitHours: parseInt(cancelFreeLimitHours),
                partialRefundPercentage: parseInt(partialRefundPercentage),
                nonRefundableLimitHours: parseInt(nonRefundableLimitHours),
                description
            }
        });

        return NextResponse.json({ success: true, policy });

    } catch (error: any) {
        console.error('Save Policy Error:', error);
        return NextResponse.json({ error: 'Erro ao salvar política de cancelamento.' }, { status: 500 });
    }
}
