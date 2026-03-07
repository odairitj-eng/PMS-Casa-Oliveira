"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface MapSectionProps {
    latitude: number | null;
    longitude: number | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
}

export function MapSection({
    latitude,
    longitude,
    neighborhood,
    city,
    state,
    country
}: MapSectionProps) {
    const [mapUrl, setMapUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (latitude && longitude) {
            setIsLoading(true);
            const zoom = 15;
            const delta = 0.01;
            setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik`);

            // Simula um loading suave para o iframe
            const timer = setTimeout(() => setIsLoading(false), 800);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(false);
        }
    }, [latitude, longitude]);

    return (
        <div id="localizacao" className="py-16 border-t border-olive-900/10 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-olive-900 mb-6">Localização</h2>

            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center gap-2 text-olive-900">
                    <div className="bg-olive-900/5 p-2 rounded-lg">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight">
                        {neighborhood ? `${neighborhood}, ` : ""}{city} — {state}, {country}
                    </span>
                </div>
                <p className="text-olive-900/50 text-sm md:text-base ml-11">
                    A localização exata é fornecida após a confirmação da reserva.
                </p>
            </div>

            <div className="w-full h-[400px] md:h-[500px] bg-sand-50/50 rounded-[2.5rem] overflow-hidden border border-olive-900/10 shadow-sm relative group transition-all duration-500 hover:shadow-md">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-olive-900/5 animate-pulse">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full border-4 border-olive-900/20 border-t-olive-900 animate-spin" />
                            <span className="text-olive-900/40 font-medium text-sm">Carregando mapa...</span>
                        </div>
                    </div>
                ) : latitude && longitude ? (
                    <div className="w-full h-full relative">
                        <div className="w-full h-full grayscale-[0.1] contrast-[1.05] brightness-[1.02]">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={mapUrl || ""}
                                className="pointer-events-none md:pointer-events-auto"
                            />
                        </div>

                        {/* Overlay sutil para manter a paleta do projeto */}
                        <div className="absolute inset-0 bg-olive-900/[0.03] pointer-events-none" />

                        {/* Marcador Customizado Estilizado (Estilo Airbnb) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative">
                                {/* Efeito de pulso externo */}
                                <div className="absolute -inset-12 bg-olive-900/10 rounded-full animate-ping duration-[3000ms]" />
                                <div className="absolute -inset-8 bg-olive-900/15 rounded-full animate-pulse duration-[2000ms]" />

                                {/* Marcador Principal */}
                                <div className="relative bg-olive-900 text-sand-50 p-4 rounded-full shadow-2xl border-[3px] border-white transform transition-transform group-hover:scale-110 duration-300">
                                    <MapPin className="w-7 h-7 fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-olive-900/20 bg-olive-900/5">
                        <div className="p-6 rounded-full bg-white/50 border border-dashed border-olive-900/20">
                            <MapPin className="w-12 h-12" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-lg text-olive-900/40">Mapa indisponível no momento</p>
                            <p className="text-sm">As coordenadas da propriedade não foram configuradas.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
