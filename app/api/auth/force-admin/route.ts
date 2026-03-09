export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * ROTA DE EMERGÊNCIA: Acessar /api/auth/force-admin?email=SEU_EMAIL
 * Isso forçará o seu usuário no banco de dados a ser ADMIN.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'E-mail não fornecido' }, { status: 400 });
    }

    try {
        const user = await db.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado no banco. Faça login pelo menos uma vez no site primeiro.' }, { status: 404 });
        }

        await db.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });

        return NextResponse.json({
            success: true,
            message: `Usuário ${email} promovido a ADMIN com sucesso no Banco de Dados.`,
            instrução: "Agora faça Logout e Login novamente no site para atualizar sua sessão."
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
