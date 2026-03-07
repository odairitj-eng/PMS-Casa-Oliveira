'use client';
import { useParams } from 'next/navigation';

export default function PropertyIntegrationsPage() {
    const params = useParams<{ id: string }>();
    return (
        <iframe
            src={`/admin/integrations?propertyId=${params.id}`}
            className="w-full h-[85vh] border-0 rounded-2xl"
            title="Integrações do Imóvel"
        />
    );
}
