export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

/**
 * Rota raiz `/` — redireciona automaticamente para o primeiro imóvel ativo.
 * Mantém retrocompatibilidade enquanto o sistema tiver 1 imóvel.
 * Com múltiplos imóveis, exibirá uma lista (futura implementação).
 */
export default async function Home() {
    const property = await db.property.findFirst({
        where: { isActive: true },
        select: { slug: true },
        orderBy: { createdAt: 'asc' },
    });

    if (!property?.slug) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-olive-900/60 font-medium">Nenhuma propriedade ativa configurada.</p>
            </div>
        );
    }

    redirect(`/${property.slug}`);
}
