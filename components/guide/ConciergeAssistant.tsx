"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    X,
    ArrowRight,
    ChevronRight,
    Info,
    Monitor,
    Wind,
    Coffee,
    Tv,
    HelpCircle,
    Phone,
    MessageSquare,
    Search,
    Camera
} from "lucide-react";

type ModuleType = "space-tour" | "house-manual" | "help-center" | "rules" | "troubleshooting";

interface ConciergeAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    moduleType: ModuleType;
    property: any;
}

export default function ConciergeAssistant({
    isOpen,
    onClose,
    moduleType,
    property
}: ConciergeAssistantProps) {
    if (!isOpen) return null;

    const renderContent = () => {
        switch (moduleType) {
            case "space-tour":
                return <SpaceTour property={property} />;
            case "house-manual":
                return <HouseManual property={property} />;
            case "help-center":
                return <HelpCenter property={property} />;
            case "troubleshooting":
                return <TroubleshootingFlow property={property} />;
            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (moduleType) {
            case "space-tour": return "Tour pelo Espaço";
            case "house-manual": return "Manual da Casa";
            case "help-center": return "Central de Ajuda";
            case "troubleshooting": return "Resolver Problema";
            default: return "Concierge";
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-[#F5EBE1] shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col">
                {/* Header */}
                <header className="px-8 py-8 flex items-center justify-between bg-white border-b border-olive-900/5">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-olive-900/40 mb-1">Assistente</p>
                        <h2 className="font-editorial text-4xl text-olive-900">{getTitle()}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-olive-900/5 hover:bg-olive-900/10 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-olive-900" />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {renderContent()}
                </div>

                {/* Footer / Quick Help */}
                <footer className="p-6 bg-white border-t border-olive-900/5 flex items-center justify-between">
                    <p className="text-xs text-olive-900/40 font-bold uppercase tracking-widest">Precisa de mais ajuda?</p>
                    <button className="flex items-center gap-2 text-olive-900 font-black uppercase tracking-widest text-[10px]">
                        Falar com Host <MessageSquare size={14} />
                    </button>
                </footer>
            </div>
        </div>
    );
}

/* --- SUB-COMPONENTS --- */

function SpaceTour({ property }: { property: any }) {
    const rooms = [
        { name: "Suíte Master", items: ["Cama King", "Smart TV 55\"", "Ar Split", "Vista Mar"], icon: Camera },
        { name: "Área Gourmet", items: ["Churrasqueira", "Frigobar", "Mesa 8 lugares"], icon: Coffee },
        { name: "Living", items: ["Sofá Premium", "Som Bose", "Adega"], icon: Tv },
    ];

    return (
        <div className="p-8 space-y-10">
            {rooms.map((room, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-white">
                    <div className="relative h-48 bg-olive-900/10">
                        {property.photos?.[i] && (
                            <Image src={property.photos[i].imageUrl} alt={room.name} fill className="object-cover" />
                        )}
                        <div className="absolute bottom-6 left-6 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg">
                            <room.icon size={20} className="text-olive-900" />
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="font-editorial text-2xl text-olive-900 mb-4">{room.name}</h3>
                        <div className="flex flex-wrap gap-2">
                            {room.items.map((item, j) => (
                                <span key={j} className="px-3 py-1 bg-olive-900/5 text-olive-900/60 text-[10px] uppercase font-black tracking-widest rounded-lg">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function HouseManual({ property }: { property: any }) {
    const items = [
        { title: "Smart TV & Streaming", desc: "Como usar Netflix e outros apps.", icon: Monitor },
        { title: "Ar-Condicionado", desc: "Controle de temperatura e modos.", icon: Wind },
        { title: "Eletrodomésticos", desc: "Máquina de café e Airfryer.", icon: Coffee },
        { title: "Lixeira e Reciclagem", desc: "Onde descartar cada material.", icon: Info },
    ];

    return (
        <div className="p-8">
            <div className="relative mb-8">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-olive-900/20" size={20} />
                <input
                    type="text"
                    placeholder="O que deseja aprender?"
                    className="w-full h-16 pl-14 pr-6 bg-white rounded-3xl border border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-olive-900/10 text-olive-900 text-sm font-medium"
                />
            </div>
            <div className="space-y-4">
                {items.map((item, i) => (
                    <button key={i} className="w-full p-6 bg-white rounded-3xl flex items-center justify-between border border-white hover:border-olive-900/10 transition-all text-left shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center text-olive-900">
                                <item.icon size={24} />
                            </div>
                            <div>
                                <h4 className="font-editorial text-xl text-olive-900">{item.title}</h4>
                                <p className="text-xs text-olive-900/40 italic">{item.desc}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-olive-900/20" size={20} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function HelpCenter({ property }: { property: any }) {
    return (
        <div className="p-8 space-y-8">
            <div className="bg-olive-900 text-sand-50 rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                    <HelpCircle size={32} />
                </div>
                <h3 className="font-editorial text-3xl mb-4">Central de Ajuda</h3>
                <p className="text-sand-50/60 text-sm leading-relaxed mb-8 italic">
                    Estamos aqui para garantir que sua estadia seja perfeita. Escolha como prefere ser atendido.
                </p>
                <button className="w-full h-16 bg-white text-olive-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg">
                    Chamar no WhatsApp
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm border border-white">
                    <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Phone size={24} />
                    </div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-olive-900/40 mb-1">Emergência</div>
                    <div className="font-editorial text-lg text-olive-900">190 / 192</div>
                </div>
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm border border-white">
                    <div className="w-12 h-12 bg-amber-50 text-amber-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={24} />
                    </div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-olive-900/40 mb-1">Portaria</div>
                    <div className="font-editorial text-lg text-olive-900">Ramal 101</div>
                </div>
            </div>
        </div>
    );
}

function TroubleshootingFlow({ property }: { property: any }) {
    const [selectedProblem, setSelectedProblem] = useState<any>(null);

    const problems = [
        {
            id: "wifi",
            title: "Wi-Fi não funciona",
            icon: Wifi,
            solution: [
                "Verifique se o roteador está ligado (luzes acesas).",
                "Tente retirar o roteador da tomada por 30 segundos e ligar novamente.",
                "Certifique-se de que a senha digitada está correta (use o atalho na Home)."
            ]
        },
        {
            id: "power",
            title: "Falta de Energia",
            icon: Wind,
            solution: [
                "Verifique o quadro de energia atrás da porta principal.",
                "Veja se algum disjuntor está desativado (para baixo).",
                "Confira se as luzes da rua/vizinhos também estão apagadas."
            ]
        },
        {
            id: "water",
            title: "Problemas com Água",
            icon: Info,
            solution: [
                "Verifique se o registro geral (no tanque) está aberto.",
                "Se a água estiver fraca, pode ser um problema temporário na região.",
                "Caso haja um vazamento, feche o registro imediatamente e nos avise."
            ]
        },
    ];

    if (selectedProblem) {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <button
                    onClick={() => setSelectedProblem(null)}
                    className="flex items-center gap-2 text-olive-900/40 font-bold uppercase tracking-widest text-[10px] mb-8"
                >
                    <ArrowLeft size={14} /> Voltar para categorias
                </button>

                <div className="mb-10">
                    <div className="w-16 h-16 bg-olive-900 text-sand-50 rounded-2xl flex items-center justify-center mb-6">
                        <selectedProblem.icon size={32} />
                    </div>
                    <h3 className="font-editorial text-3xl text-olive-900 mb-4">{selectedProblem.title}</h3>
                </div>

                <div className="space-y-4">
                    {selectedProblem.solution.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-white shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-olive-900/5 flex items-center justify-center text-[10px] font-black text-olive-900">
                                {i + 1}
                            </div>
                            <p className="text-sm text-olive-900/80 leading-relaxed font-medium">{step}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-olive-900/5 rounded-3xl text-center">
                    <p className="text-sm font-bold text-olive-900 mb-6 italic">Isso resolveu o seu problema?</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSelectedProblem(null)}
                            className="flex-1 h-14 bg-white text-olive-900 rounded-xl font-bold text-xs uppercase tracking-widest border border-olive-900/10"
                        >
                            Sim, resolvido
                        </button>
                        <button className="flex-1 h-14 bg-olive-900 text-sand-50 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
                            Não, falar com Host
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <p className="text-sm text-olive-900/60 leading-relaxed italic mb-8">
                Selecione a categoria do problema para tentarmos uma solução rápida agora mesmo.
            </p>
            <div className="grid grid-cols-1 gap-4">
                {problems.map((prob) => (
                    <button
                        key={prob.id}
                        onClick={() => setSelectedProblem(prob)}
                        className="p-6 bg-white rounded-3xl flex items-center justify-between border border-white hover:border-olive-900/10 transition-all text-left shadow-sm"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-olive-900/5 rounded-2xl flex items-center justify-center text-olive-900">
                                <prob.icon size={24} />
                            </div>
                            <h4 className="font-editorial text-xl text-olive-900">{prob.title}</h4>
                        </div>
                        <ChevronRight className="text-olive-900/20" size={20} />
                    </button>
                ))}
            </div>
        </div>
    );
}

const ArrowLeft = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5M18 12H6" /></svg>
);

const Wifi = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M2 8.82a15 15 0 0 1 20 0" /><line x1="12" x2="12.01" y1="20" y2="20" /></svg>
);
