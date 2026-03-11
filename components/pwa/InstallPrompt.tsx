"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Detectar se é iOS (Safari no iOS não suporta beforeinstallprompt)
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Verifica se já está no modo standalone (instalado)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (isStandalone) return;

        // Se for iOS, mostramos o prompt manual se não foi descartado
        if (isIOSDevice) {
            const isDismissed = sessionStorage.getItem("pwa_prompt_dismissed");
            if (!isDismissed) {
                // Pequeno delay para não assustar o usuário
                const timer = setTimeout(() => setIsVisible(true), 2000);
                return () => clearTimeout(timer);
            }
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            const isDismissed = sessionStorage.getItem("pwa_prompt_dismissed");
            if (!isDismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("pwa_prompt_dismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[100] md:hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-olive-900/10 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-olive-900 rounded-2xl flex items-center justify-center text-sand-50 shadow-lg shadow-olive-900/20">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-olive-900 text-sm">Instalar App Casa Oliveira</h3>
                            <p className="text-[10px] text-olive-900/40 leading-tight font-black uppercase tracking-widest">App Profissional PWA</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="p-2 hover:bg-olive-900/5 rounded-full text-olive-900/40 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isIOS ? (
                    <div className="bg-olive-900/[0.03] p-5 rounded-2xl border border-olive-900/5 space-y-3">
                        <p className="text-[11px] text-olive-900/80 font-medium leading-relaxed">
                            Para transformar em App e remover a barra do navegador:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm text-[10px] font-black text-olive-900">1</span>
                                <p className="text-[11px] text-olive-900 font-bold">Toque no ícone de Compartilhar (quadrado com seta)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm text-[10px] font-black text-olive-900">2</span>
                                <p className="text-[11px] text-olive-900 font-bold">Role e toque em &quot;Adicionar à Tela de Início&quot;</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Button
                            onClick={handleInstall}
                            className="flex-1 h-12 bg-olive-900 hover:bg-olive-800 text-sand-50 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-olive-900/20 active:scale-95 transition-all"
                        >
                            <Download className="w-5 h-5" /> Instalar Agora
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleDismiss}
                            className="px-6 h-12 rounded-xl text-olive-900/40 font-bold border border-olive-900/5 hover:bg-olive-900/5 active:scale-95 transition-all"
                        >
                            Depois
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
