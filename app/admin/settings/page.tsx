import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

/**
 * /admin/settings redireciona para /admin/properties/[id]/settings do primeiro imóvel ativo.
 * Mantém compatibilidade com links e bookmarks existentes.
 */
export default async function AdminSettingsRedirectPage() {
    const property = await db.property.findFirst({
        where: { isActive: true },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
    });

    if (!property) {
        redirect('/admin/properties');
    }

    redirect(`/admin/properties/${property.id}/settings`);
}
