import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Tenta uma consulta simples
        const propertyCount = await db.property.count();

        return NextResponse.json({
            status: 'success',
            message: 'Conexão com o banco de dados está funcionando.',
            data: {
                propertyCount
            }
        });
    } catch (error: any) {
        console.error('[DATABASE DIAGNOSTIC ERROR]:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Falha na conexão com o banco de dados.',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
