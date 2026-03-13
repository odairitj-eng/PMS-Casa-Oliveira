"use client";

import React from "react";
import Image from "next/image";

interface GuideHeaderProps {
    propertyName: string;
    locationText?: string;
    imageUrl?: string;
    welcomeMessage?: string;
}

export default function GuideHeader({
    propertyName,
    locationText,
    imageUrl,
    welcomeMessage,
}: GuideHeaderProps) {
    return (
        <div className="relative h-[90vh] flex flex-col">
            {/* Background Image Container */}
            <div className="flex-1 relative overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={propertyName}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-olive-900" />
                )}

                {/* Vertical Text Side Bar */}
                <div className="absolute top-0 left-0 h-full w-24 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <h1 className="font-editorial text-7xl text-white -rotate-90 whitespace-nowrap opacity-90 tracking-widest uppercase">
                        Boas Vindas
                    </h1>
                </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-xl z-10 border-8 border-[#F5EBE1]">
                <span className="font-editorial text-xl italic text-olive-800">Seu</span>
                <span className="font-editorial text-4xl font-bold uppercase tracking-tighter text-olive-900">Guia</span>
            </div>

            {/* Bottom Info Section */}
            <div className="h-[25vh] bg-[#F5EBE1] pt-24 pb-8 px-6 flex flex-col items-center justify-center text-center">
                <p className="text-olive-800 tracking-[0.3em] uppercase text-xs mb-4 font-medium italic">
                    {locationText || propertyName}
                </p>
                <div className="w-full h-[1px] bg-olive-900/10 mb-6" />
                <div className="flex justify-between w-full max-w-xs text-[10px] uppercase tracking-widest text-olive-900/60 font-bold">
                    <span>Sobre o Espaço</span>
                    <span className="h-full w-[1px] bg-olive-900/10" />
                    <span>Informações</span>
                    <span className="h-full w-[1px] bg-olive-900/10" />
                    <span>Região</span>
                </div>
            </div>
        </div>
    );
}
