"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";

export function Amenities({ amenities = [] }: { amenities?: any[] }) {
    const [showAll, setShowAll] = useState(false);

    // Helper to render Lucide Icons by string name dynamically
    const IconComponent = ({ name, className }: { name: string, className?: string }) => {
        const Icon = (LucideIcons as any)[name] || LucideIcons.CheckCircle2;
        return <Icon className={className} />;
    };

    if (amenities.length === 0) {
        return null;
    }

    const displayedAmenities = showAll ? amenities : amenities.slice(0, 6);

    return (
        <div className="py-8 border-b border-olive-900/10">
            <h3 className="text-2xl font-bold mb-6">O que esse lugar oferece</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedAmenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-olive-900/80">
                        <IconComponent name={item.iconName || 'CheckCircle2'} className="w-6 h-6 stroke-[1.5]" />
                        <span className="text-lg">{item.amenityName}</span>
                    </div>
                ))}
            </div>

            {amenities.length > 6 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-8 px-6 py-3 border border-olive-900/30 text-olive-900 rounded-xl font-bold hover:bg-olive-900/5 transition-colors"
                >
                    {showAll ? "Mostrar menos comodidades" : `Mostrar todas as ${amenities.length} comodidades`}
                </button>
            )}
        </div>
    );
}
