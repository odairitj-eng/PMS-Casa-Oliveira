"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    X,
    ArrowRight,
    ArrowLeft,
    MapPin,
    Car,
    Key,
    DoorOpen,
    Compass,
    CheckCircle2
} from "lucide-react";

interface Step {
    id: number;
    title: string;
    description: string;
    icon: any;
    image?: string;
    instructions: string[];
}

interface GuidedCheckInProps {
    isOpen: boolean;
    onClose: () => void;
    property: any;
}

export default function GuidedCheckIn({
    isOpen,
    onClose,
    property
}: GuidedCheckInProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const steps: Step[] = [
        {
            id: 1,
            title: "Como Chegar",
            description: "Encontre a Casa Oliveira com facilidade.",
            icon: MapPin,
            image: property.photos?.[0]?.imageUrl,
            instructions: [
                "O imóvel fica na " + (property.street || "rua principal") + ", número " + (property.streetNumber || "S/N"),
                "Ponto de referência: Próximo ao Centro Histórico.",
                "Utilize o link do Waze ou Google Maps enviado no WhatsApp."
            ]
        },
        {
            id: 2,
            title: "Estacionamento",
            description: "Onde deixar seu veículo com segurança.",
            icon: Car,
            instructions: [
                "Temos uma vaga privativa coberta (Vaga 12).",
                "O portão é automático e abre com o controle que está na chave.",
                "Se estiver com mais de um carro, há vagas rotativas na frente."
            ]
        },
        {
            id: 3,
            title: "Entrada no Imóvel",
            description: "Acessando o hall principal.",
            icon: DoorOpen,
            instructions: [
                "A entrada principal fica à direita do portão de garagem.",
                "O interfone é o número 101.",
                "A nossa equipe já estará avisada da sua chegada."
            ]
        },
        {
            id: 4,
            title: "Chaves / Fechadura",
            description: "Como abrir a porta.",
            icon: Key,
            instructions: [
                "Utilize a senha enviada por SMS (6 dígitos).",
                "Digite a senha e aperte '#'.",
                "Aguarde o sinal sonoro e puxe a maçaneta."
            ]
        },
        {
            id: 5,
            title: "Primeiros Passos",
            description: "Sinta-se em casa.",
            icon: Compass,
            instructions: [
                "O quadro de energia fica atrás da porta da sala (caso precise).",
                "O Wi-Fi conecta automaticamente via QR Code na sala.",
                "Há água filtrada na geladeira esperando por você."
            ]
        }
    ];

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            onClose();
        }
    };

    const back = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
        }
    };

    const step = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col md:inset-4 md:rounded-[3rem] md:shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between border-b border-olive-900/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-olive-900 text-sand-50 rounded-full flex items-center justify-center font-editorial text-sm">
                        {step.id}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-olive-900/40">Check-in Guiado</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-olive-900/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-olive-900" />
                </button>
            </header>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-olive-900/5">
                <div
                    className="h-full bg-olive-900 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-8 md:p-12 max-w-2xl mx-auto w-full flex-1">
                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-sage-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-olive-900">
                            <step.icon size={40} />
                        </div>
                        <h2 className="font-editorial text-4xl text-olive-900 mb-2">{step.title}</h2>
                        <p className="text-olive-800/60 font-medium italic">{step.description}</p>
                    </div>

                    <div className="space-y-6">
                        {step.instructions.map((inst, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-olive-900/[0.02] rounded-2xl border border-olive-900/5 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="mt-1">
                                    <CheckCircle2 className="w-5 h-5 text-olive-900/20" />
                                </div>
                                <p className="text-sm font-bold text-olive-900/80 leading-relaxed">{inst}</p>
                            </div>
                        ))}
                    </div>

                    {step.image && (
                        <div className="mt-12 relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-white">
                            <Image src={step.image} alt={step.title} fill className="object-cover" />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            <footer className="p-8 md:p-12 border-t border-olive-900/5 bg-[#FDFBF9] flex gap-4">
                {currentStep > 0 && (
                    <button
                        onClick={back}
                        className="h-16 px-8 rounded-2xl border-2 border-olive-900/10 text-olive-900 font-bold flex items-center justify-center gap-2 hover:bg-olive-900/5 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden md:inline uppercase tracking-widest text-xs">Anterior</span>
                    </button>
                )}
                <button
                    onClick={next}
                    className="flex-1 h-16 bg-olive-900 text-sand-50 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-olive-800 shadow-xl transition-all active:scale-95"
                >
                    <span className="uppercase tracking-widest text-xs">
                        {currentStep === steps.length - 1 ? "Começar Estadia" : "Próximo Passo"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </footer>
        </div>
    );
}
