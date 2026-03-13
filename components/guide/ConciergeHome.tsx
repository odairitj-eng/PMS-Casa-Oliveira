"use client";

import React from "react";
import Image from "next/image";
import {
    Calendar,
    Wifi,
    MapPin,
    MessageCircle,
    Home,
    HelpCircle,
    AlertTriangle,
    ShieldCheck,
    Clock,
    ChevronRight,
    Map
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConciergeHomeProps {
    guestName?: string;
    reservation?: {
        checkIn: string;
        checkOut: string;
        totalNights: number;
        status: string;
    };
    property: {
        publicTitle: string;
        name: string;
        locationText?: string;
        photos?: any[];
        street?: string;
        streetNumber?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
    };
    accentColor?: string;
    onNavigate: (sectionId: string) => void;
}

export default function ConciergeHome({
    guestName,
    reservation,
    property,
    accentColor = "#2D3B2D", // Olive Default
    onNavigate
}: ConciergeHomeProps) {
    const firstName = guestName?.split(" ")[0] || "Hóspede";
    const primaryPhoto = property.photos?.[0]?.imageUrl;

    const checkInDate = reservation ? new Date(reservation.checkIn) : null;
    const checkOutDate = reservation ? new Date(reservation.checkOut) : null;

    const shortcuts = [
        { id: "guided-checkin", label: "Como entrar", icon: MapPin, color: "bg-sage-100 text-olive-900" },
        { id: "wifi", label: "Wi-Fi", icon: Wifi, color: "bg-blue-50 text-blue-900" },
        { id: "rules", label: "Regras", icon: ShieldCheck, color: "bg-sand-100 text-amber-900" },
        { id: "region-guide", label: "Arredores", icon: Map, color: "bg-olive-50 text-olive-900" },
        { id: "help", label: "Ajuda", icon: HelpCircle, color: "bg-purple-50 text-purple-900" },
        { id: "problem", label: "Problemas", icon: AlertTriangle, color: "bg-red-50 text-red-900" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#F5EBE1]">
            {/* Header / Hero */}
            <div className="relative h-[60vh] overflow-hidden">
                {primaryPhoto ? (
                    <Image
                        src={primaryPhoto}
                        alt={property.publicTitle}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-olive-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#F5EBE1] via-transparent to-black/20" />

                {/* Logo Overlay */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                        <span className="font-editorial text-xl text-olive-900">CO</span>
                    </div>
                </div>

                {/* Welcome Overlay */}
                <div className="absolute bottom-12 left-0 w-full px-8">
                    <p className="font-editorial text-2xl italic text-olive-800 mb-1">
                        Olá, {firstName}
                    </p>
                    <h1 className="font-editorial text-5xl text-olive-900 leading-tight">
                        Bem-vindo à <br />
                        <span className="font-bold underline decoration-accent/30" style={{ textDecorationColor: accentColor + '44' }}>
                            {property.publicTitle || property.name}
                        </span>
                    </h1>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-8 -mt-6 relative z-10 pb-24">

                {/* Stay Summary Card */}
                {reservation && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-olive-900/5 mb-10 border border-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-olive-900/40">Sua Estadia</h3>
                            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {reservation.status === "CONFIRMED" ? "Confirmada" : reservation.status}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex-1">
                                <p className="text-[10px] text-olive-800/60 uppercase font-black tracking-widest mb-1">Check-in</p>
                                <p className="font-editorial text-xl text-olive-900">
                                    {checkInDate ? format(checkInDate, "dd MMM", { locale: ptBR }) : "--"}
                                </p>
                                <p className="text-xs text-olive-800/40 uppercase font-bold mt-1">15:00h</p>
                            </div>
                            <div className="h-10 w-[1px] bg-olive-900/5" />
                            <div className="flex-1">
                                <p className="text-[10px] text-olive-800/60 uppercase font-black tracking-widest mb-1">Check-out</p>
                                <p className="font-editorial text-xl text-olive-900">
                                    {checkOutDate ? format(checkOutDate, "dd MMM", { locale: ptBR }) : "--"}
                                </p>
                                <p className="text-xs text-olive-800/40 uppercase font-bold mt-1">11:00h</p>
                            </div>
                            <div className="h-10 w-[1px] bg-olive-900/5" />
                            <div className="flex-initial text-center px-4">
                                <p className="text-[10px] text-olive-800/60 uppercase font-black tracking-widest mb-1">Noites</p>
                                <p className="font-editorial text-xl text-olive-900 font-bold">{reservation.totalNights}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shortcuts Grid */}
                <div className="mb-12">
                    <h3 className="font-editorial text-2xl text-olive-900 mb-6 px-2">Acesso Rápido</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {shortcuts.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className="flex items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-white hover:shadow-md transition-all active:scale-95 text-left"
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-olive-900 uppercase tracking-widest leading-tight">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline / Status */}
                <div className="bg-olive-900/5 rounded-[2.5rem] p-8 border border-olive-900/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Clock className="w-5 h-5 text-olive-900" />
                        </div>
                        <h3 className="font-editorial text-2xl text-olive-900">Timeline</h3>
                    </div>

                    <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-olive-900/10">
                        <div className="relative pl-12">
                            <div className="absolute left-4 top-1.5 w-2 h-2 rounded-full bg-olive-900" />
                            <p className="text-[10px] text-olive-900/40 uppercase font-bold mb-1 tracking-widest">Hoje</p>
                            <p className="text-sm font-bold text-olive-900">Prepare sua chegada</p>
                            <p className="text-xs text-olive-900/60 mt-1">Check-in disponível a partir das 15h.</p>
                        </div>
                        <div className="relative pl-12">
                            <div className="absolute left-4 top-1.5 w-2 h-2 rounded-full bg-olive-900/20" />
                            <p className="text-[10px] text-olive-900/40 uppercase font-bold mb-1 tracking-widest">Durante a estadia</p>
                            <p className="text-sm font-bold text-olive-900/60">Aproveite a nossa curadoria</p>
                        </div>
                        <div className="relative pl-12 opacity-40">
                            <div className="absolute left-4 top-1.5 w-2 h-2 rounded-full bg-olive-900/20" />
                            <p className="text-[10px] text-olive-900/40 uppercase font-bold mb-1 tracking-widest">Saída</p>
                            <p className="text-sm font-bold text-olive-900">Checkout</p>
                            <p className="text-xs text-olive-900/60 mt-1">Até às 11h. Lembramos de fechar as janelas.</p>
                        </div>
                    </div>
                </div>

                {/* Address Card (Private Only) */}
                {property.street && (
                    <div className="mt-10 bg-white rounded-[2.5rem] p-8 shadow-sm border border-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-olive-900/5 rounded-xl">
                                    <MapPin className="w-5 h-5 text-olive-900" />
                                </div>
                                <h3 className="font-editorial text-2xl text-olive-900">Localização</h3>
                            </div>
                            <button className="text-olive-900/40 hover:text-olive-900 transition-colors">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-sm font-medium text-olive-900/80 leading-relaxed italic mb-4">
                            {property.street}, {property.streetNumber} - {property.neighborhood}<br />
                            {property.city}, {property.state}
                        </p>
                        <button className="w-full h-14 bg-olive-900 text-sand-50 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all">
                            <Image src="/imagens/logo.png?v=4" alt="Logo" width={20} height={20} className="invert brightness-200" />
                            Abrir no Google Maps
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
