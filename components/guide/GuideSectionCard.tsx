"use client";

import React from "react";
import Image from "next/image";
import { type SectionType } from "@prisma/client";
import {
    Wifi,
    Key,
    Utensils,
    Info,
    MapPin,
    AlertCircle,
    Clock,
    ClipboardList,
    Heart,
    Home,
    MessageCircle,
    Car
} from "lucide-react";

interface GuideSectionCardProps {
    type: SectionType;
    title: string;
    content?: string;
    imageUrl?: string;
    iconName?: string;
    config?: any;
}

const ICON_MAP: Record<string, any> = {
    WELCOME: Heart,
    HOST: MessageCircle,
    ABOUT_SPACE: Home,
    CHECK_IN: Key,
    CHECK_OUT: Clock,
    HOUSE_RULES: ClipboardList,
    WIFI: Wifi,
    HOW_TO_GET: MapPin,
    HOUSE_MANUAL: Info,
    EMERGENCY: AlertCircle,
    TRANSPORT: Car,
    OTHER: Info,
};

export default function GuideSectionCard({
    type,
    title,
    content,
    imageUrl,
    iconName,
    config,
}: GuideSectionCardProps) {
    const Icon = ICON_MAP[type] || Info;

    return (
        <section className="bg-white my-12 mx-6 rounded-3xl overflow-hidden shadow-sm border border-olive-900/5">
            {imageUrl && (
                <div className="relative h-64 w-full">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="p-8">
                <header className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-olive-50 flex items-center justify-center text-olive-900">
                        <Icon size={24} />
                    </div>
                    <h2 className="font-editorial text-3xl text-olive-900 border-b-2 border-olive-900/10 pb-1">
                        {title}
                    </h2>
                </header>

                {type === "WIFI" && config?.ssid && (
                    <div className="bg-[#eef7ea] p-6 rounded-2xl mb-6 flex flex-col items-center">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-olive-800/60 font-bold mb-1">Rede</p>
                            <p className="font-editorial text-xl text-olive-900 mb-4">{config.ssid}</p>

                            <p className="text-[10px] uppercase tracking-widest text-olive-800/60 font-bold mb-1">Senha</p>
                            <p className="font-editorial text-xl text-olive-900 select-all">{config.password}</p>
                        </div>

                        {/* QR Code Placeholder/Button */}
                        <button className="mt-6 px-6 py-3 bg-olive-900 text-sand-50 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-olive-800 transition-colors">
                            Conectar Automaticamente
                        </button>
                    </div>
                )}

                <div className="prose prose-olive max-w-none">
                    {content?.split('\n').map((paragraph, i) => (
                        <p key={i} className="text-olive-800/80 leading-relaxed mb-4 text-sm">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}
