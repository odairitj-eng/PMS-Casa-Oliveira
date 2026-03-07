'use client';
import { useParams } from 'next/navigation';

export default function PropertyPricingPage() {
    const params = useParams<{ id: string }>();
    return (
        <iframe
            src={`/admin/pricing?propertyId=${params.id}`}
            className="w-full h-[85vh] border-0 rounded-2xl"
            title="Pricing do Imóvel"
        />
    );
}
