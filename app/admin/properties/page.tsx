export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { Building2, Plus, ExternalLink, Settings, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyStatusToggle } from '@/components/admin/PropertyStatusToggle';

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default async function PropertiesPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        redirect('/auth/signin');
    }

    const properties = await db.property.findMany({
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            name: true,
            slug: true,
            publicTitle: true,
            isActive: true,
            city: true,
            state: true,
            basePrice: true,
            maxGuests: true,
            createdAt: true,
            _count: { select: { reservations: true, photos: true } },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-olive-900/5 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-olive-900">Imóveis</h1>
                    <p className="text-olive-900/60 font-medium">Gerencie todas as propriedades do sistema.</p>
                </div>
                <Link href="/admin/properties/new">
                    <Button className="h-12 px-6 rounded-2xl bg-olive-900 hover:bg-olive-800 text-sand-50 font-bold flex items-center gap-2 shadow-lg shadow-olive-900/10">
                        <Plus className="w-5 h-5" /> Novo Imóvel
                    </Button>
                </Link>
            </div>

            {properties.length === 0 ? (
                <Card className="rounded-[2rem]">
                    <CardContent className="flex flex-col items-center justify-center h-48 text-olive-900/40 gap-4">
                        <Building2 className="w-10 h-10" />
                        <p className="font-medium">Nenhum imóvel cadastrado.</p>
                        <Link href="/admin/properties/new">
                            <Button variant="outline" className="rounded-xl font-bold">Cadastrar primeiro imóvel</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {properties.map(p => (
                        <Card key={p.id} className="rounded-[2rem] border border-olive-900/5 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-olive-900/5 flex items-center justify-center">
                                        <Building2 className="w-7 h-7 text-olive-700" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="font-bold text-xl text-olive-900 truncate">{p.publicTitle || p.name}</h2>
                                            {p.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3 h-3" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                    <XCircle className="w-3 h-3" /> Inativo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-olive-900/50 font-medium mt-0.5">
                                            {p.city && p.state ? `${p.city}, ${p.state}` : 'Localização não cadastrada'} ·{' '}
                                            {formatCurrency(p.basePrice)}/noite · {p.maxGuests} hóspedes ·{' '}
                                            {p._count.reservations} reservas · {p._count.photos} fotos
                                        </p>
                                        <p className="text-xs text-olive-900/30 font-mono mt-1">/{p.slug}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <a
                                            href={`/${p.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-olive-900/40 hover:text-olive-900 rounded-xl hover:bg-olive-900/5 transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                        {/* Client component for toggle */}
                                        <PropertyStatusToggle propertyId={p.id} isActive={p.isActive} />
                                        <Link href={`/admin/properties/${p.id}/settings`}>
                                            <button className="flex items-center gap-1.5 px-4 h-10 bg-olive-900 hover:bg-olive-800 text-white rounded-xl font-bold text-sm transition-colors">
                                                <Settings className="w-4 h-4" /> Gerenciar <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
