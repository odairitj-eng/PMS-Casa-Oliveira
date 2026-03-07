'use client';

import { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function PropertyStatusToggle({ propertyId, isActive }: { propertyId: string; isActive: boolean }) {
    const [active, setActive] = useState(isActive);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggle = async () => {
        setLoading(true);
        try {
            await axios.patch(`/api/admin/properties/${propertyId}`, { isActive: !active });
            setActive(v => !v);
            toast.success(active ? 'Imóvel desativado' : 'Imóvel ativado');
            router.refresh(); // revalidate server component
        } catch {
            toast.error('Erro ao atualizar status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggle}
            disabled={loading}
            className={`p-2 rounded-xl hover:bg-olive-900/5 transition-colors ${active ? 'text-green-600' : 'text-red-500'} ${loading ? 'opacity-50' : ''}`}
            title={active ? 'Desativar' : 'Ativar'}
        >
            {active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </button>
    );
}
