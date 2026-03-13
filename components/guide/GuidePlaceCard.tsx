"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink, Navigation } from "lucide-react";
// @ts-ignore
import { PlaceCategory } from "@prisma/client";

interface GuidePlaceCardProps {
    name: string;
    category: PlaceCategory;
    description?: string;
    imageUrl?: string;
    distance?: string;
    googleMapsUrl?: string;
}

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
    RESTAURANT: "Restaurante",
    CAFE: "Café",
    SUPERMARKET: "Supermercado",
    MARKET: "Mercado Local",
    PHARMACY: "Farmácia",
    PARK: "Parque / Ar Livre",
    GYM_YOGA: "Academia / Yoga",
    DELIVERY: "Delivery",
    FOR_KIDS: "Para Crianças",
    ATTRACTION: "Atração / Turismo",
    BREAKFAST: "Café da Manhã",
    ROMANTIC: "Romântico",
    FAMILY: "Família",
    TO_GO: "Para Levar",
    OTHER: "Local",
};

export default function GuidePlaceCard({
    name,
    category,
    description,
    imageUrl,
    distance,
    googleMapsUrl,
}: GuidePlaceCardProps) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-olive-900/5 mb-6">
            <div className="flex h-32">
                <div className="flex-1 p-4 bg-white flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-olive-800/40 font-bold mb-1 block">
                            {CATEGORY_LABELS[category]}
                        </span>
                        <h3 className="font-editorial text-lg text-olive-900 leading-tight mb-1">{name}</h3>
                        {distance && (
                            <p className="text-[10px] text-olive-800/60 font-medium flex items-center gap-1">
                                <Navigation size={10} /> {distance}
                            </p>
                        )}
                    </div>

                    {googleMapsUrl && (
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-olive-900 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                        >
                            Ver no Mapa <ExternalLink size={10} />
                        </a>
                    )}
                </div>

                {imageUrl && (
                    <div className="relative w-32 h-full">
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
            </div>

            {description && (
                <div className="p-4 pt-0 border-t border-olive-900/5 bg-olive-50/10">
                    <p className="text-xs text-olive-800/70 italic leading-relaxed pt-3">
                        "{description}"
                    </p>
                </div>
            )}
        </div>
    );
}
