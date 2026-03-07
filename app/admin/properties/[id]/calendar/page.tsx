'use client';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Reuse the existing admin calendar page but scoped to this property
// The PropertyCalendarWrapper renders the existing calendar with a pre-set propertyId
export default function PropertyCalendarPage() {
    const params = useParams<{ id: string }>();
    return (
        <div>
            {/* The calendar page already works by propertyId — we just pass it via context */}
            <iframe
                src={`/admin/calendar?propertyId=${params.id}`}
                className="w-full h-[85vh] border-0 rounded-2xl"
                title="Calendário do Imóvel"
            />
        </div>
    );
}
