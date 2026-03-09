export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

/**
 * Rota /admin — redireciona para o dashboard.
 */
export default function AdminIndexPage() {
    redirect('/admin/dashboard');
}
