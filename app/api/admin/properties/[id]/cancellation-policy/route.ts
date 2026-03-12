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

        // 1. Buscar a propriedade para ver se já tem uma política associada
        const property = await db.property.findUnique({
            where: { id },
            include: { cancellationPolicy: true }
        });

        let policy;

        if (property?.cancellationPolicyId) {
            // 2. Se já existe, atualiza
            policy = await db.cancellationPolicy.update({
                where: { id: property.cancellationPolicyId },
                data: {
                    name,
                    cancelFreeLimitHours: parseInt(cancelFreeLimitHours),
                    partialRefundPercentage: parseInt(partialRefundPercentage),
                    nonRefundableLimitHours: parseInt(nonRefundableLimitHours),
                    description
                }
            });
        } else {
            // 3. Se não existe, cria uma nova e vincula à propriedade
            policy = await db.cancellationPolicy.create({
                data: {
                    name,
                    cancelFreeLimitHours: parseInt(cancelFreeLimitHours),
                    partialRefundPercentage: parseInt(partialRefundPercentage),
                    nonRefundableLimitHours: parseInt(nonRefundableLimitHours),
                    description,
                    properties: {
                        connect: { id }
                    }
                }
            });
        }

        return NextResponse.json({ success: true, policy });

    } catch (error: any) {
        console.error('Save Policy Error:', error);
        return NextResponse.json({ error: 'Erro ao salvar política de cancelamento.' }, { status: 500 });
    }
}
