"use client";

import { WifiOff, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-sand-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-olive-900/5 rounded-full flex items-center justify-center text-olive-900 animate-pulse">
                        <WifiOff className="w-12 h-12" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-olive-900 uppercase tracking-tighter">Você está offline</h1>
                        <p className="text-olive-900/60 font-medium">
                            Parece que sua conexão com a internet caiu. <br />
                            A Casa Oliveira continua aqui esperando você voltar!
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-8">
                    <Button
                        onClick={() => window.location.reload()}
                        className="h-14 bg-olive-900 hover:bg-olive-800 text-sand-50 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-xl shadow-olive-900/20"
                    >
                        <RefreshCw className="w-5 h-5" /> Tentar Novamente
                    </Button>

                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="w-full h-14 rounded-2xl text-olive-900/40 font-bold hover:bg-olive-900/5 transition-all"
                        >
                            <Home className="w-5 h-5 mr-2" /> Voltar ao Início
                        </Button>
                    </Link>
                </div>

                <div className="pt-12 text-olive-900/20 text-xs font-bold uppercase tracking-widest">
                    Casa Oliveira PMS — App Mode
                </div>
            </div>
        </div>
    );
}
