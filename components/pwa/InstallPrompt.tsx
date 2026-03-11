"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Verifica se já foi fechado nesta sessão para não ser intrusivo
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
                        <div className="w-12 h-12 bg-olive-900 rounded-2xl flex items-center justify-center text-sand-50">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-olive-900">Instalar Casa Oliveira</h3>
                            <p className="text-sm text-olive-900/60 leading-tight">Accesse rapidamente como um aplicativo direto da sua tela inicial.</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="p-2 hover:bg-olive-900/5 rounded-full text-olive-900/40">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={handleInstall}
                        className="flex-1 h-12 bg-olive-900 hover:bg-olive-800 text-sand-50 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" /> Instalar Agora
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleDismiss}
                        className="px-6 h-12 rounded-xl text-olive-900/60 font-bold border border-olive-900/5"
                    >
                        Depois
                    </Button>
                </div>
            </div>
        </div>
    );
}
