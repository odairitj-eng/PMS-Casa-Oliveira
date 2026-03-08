'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewPropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        publicTitle: '',
        basePrice: '',
        cleaningFee: '',
        minimumNights: '2',
        maxGuests: '4',
        bedrooms: '1',
        beds: '1',
        bathrooms: '1',
        city: '',
        state: '',
        country: 'Brasil',
    });

    const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/admin/properties', {
                ...form,
                basePrice: parseFloat(form.basePrice),
                cleaningFee: parseFloat(form.cleaningFee || '0'),
                minimumNights: parseInt(form.minimumNights),
                maxGuests: parseInt(form.maxGuests),
                bedrooms: parseInt(form.bedrooms),
                beds: parseInt(form.beds),
                bathrooms: parseInt(form.bathrooms),
            });
            toast.success('Imóvel criado com sucesso!');
            router.push(`/admin/properties/${res.data.id}/settings`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erro ao criar imóvel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/properties">
                    <button className="p-2 rounded-xl hover:bg-olive-900/5 text-olive-900/60 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-olive-900">Novo Imóvel</h1>
                    <p className="text-olive-900/60 font-medium">Preencha os dados básicos para criar o imóvel.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-olive-900/5 p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-olive-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-olive-700" />
                    </div>
                    <div>
                        <p className="font-bold text-olive-900">Informações Básicas</p>
                        <p className="text-sm text-olive-900/50">Você poderá editar todos os detalhes depois.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-olive-900/70">Nome Interno (Admin) *</Label>
                        <Input
                            required
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="Ex: Casa Oliveira — Vista Panorâmica"
                            className="h-12 rounded-xl border-olive-900/10"
                        />
                        <p className="text-xs text-olive-900/40">Nome curto apenas para identificação no sistema.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-olive-900/70">Título Público (Anúncio)</Label>
                        <Input
                            value={form.publicTitle}
                            onChange={e => set('publicTitle', e.target.value)}
                            placeholder="Ex: Charmosa Casa de Campo com Deck"
                            className="h-12 rounded-xl border-olive-900/10"
                        />
                        <p className="text-xs text-olive-900/40">Como os hóspedes verão o título do imóvel.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Preço Base / Noite *</Label>
                            <Input
                                required type="number" min="1" step="0.01"
                                value={form.basePrice}
                                onChange={e => set('basePrice', e.target.value)}
                                placeholder="Ex: 450"
                                className="h-12 rounded-xl border-olive-900/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Taxa de Limpeza</Label>
                            <Input
                                type="number" min="0" step="0.01"
                                value={form.cleaningFee}
                                onChange={e => set('cleaningFee', e.target.value)}
                                placeholder="Ex: 150"
                                className="h-12 rounded-xl border-olive-900/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Mín. de Noites</Label>
                            <Input
                                type="number" min="1"
                                value={form.minimumNights}
                                onChange={e => set('minimumNights', e.target.value)}
                                className="h-12 rounded-xl border-olive-900/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Máx. de Hóspedes</Label>
                            <Input
                                type="number" min="1"
                                value={form.maxGuests}
                                onChange={e => set('maxGuests', e.target.value)}
                                className="h-12 rounded-xl border-olive-900/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Quartos</Label>
                            <Input
                                type="number" min="0"
                                value={form.bedrooms}
                                onChange={e => set('bedrooms', e.target.value)}
                                className="h-12 rounded-xl border-olive-900/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Camas</Label>
                            <Input
                                type="number" min="0"
                                value={form.beds}
                                onChange={e => set('beds', e.target.value)}
                                className="h-12 rounded-xl border-olive-900/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Banheiros</Label>
                            <Input
                                type="number" min="0"
                                value={form.bathrooms}
                                onChange={e => set('bathrooms', e.target.value)}
                                className="h-12 rounded-xl border-olive-900/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Cidade</Label>
                            <Input value={form.city} onChange={e => set('city', e.target.value)} className="h-12 rounded-xl border-olive-900/10" placeholder="Itajaí" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">Estado</Label>
                            <Input value={form.state} onChange={e => set('state', e.target.value)} className="h-12 rounded-xl border-olive-900/10" placeholder="SC" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-olive-900/70">País</Label>
                            <Input value={form.country} onChange={e => set('country', e.target.value)} className="h-12 rounded-xl border-olive-900/10" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-olive-900/5">
                        <Link href="/admin/properties" className="flex-1">
                            <Button type="button" variant="secondary" className="w-full h-12 rounded-xl font-bold">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-12 rounded-xl font-bold bg-olive-900 hover:bg-olive-800 text-sand-50"
                        >
                            {loading ? 'Criando...' : 'Criar Imóvel'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
