"use client";

import Image from "next/image";
import Link from "next/link";
import { LoginButtons } from "@/components/auth/LoginButtons";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "";
    const isAdminLogin = callbackUrl.includes("/admin");

    return (
        <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-6 bg-[url('/imagens/pattern.png')] bg-repeat">
            <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-olive-900/5 transition-all animate-in fade-in slide-in-from-bottom-8 duration-700">

                <div className="text-center space-y-6">
                    <div className="inline-block rounded-[2.5rem] overflow-hidden mb-2 shadow-xl shadow-olive-900/10">
                        <Image
                            src="/imagens/logo.png"
                            alt="Casa Oliveira"
                            width={100}
                            height={100}
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-olive-900 tracking-tight">
                            {isAdminLogin ? "Painel Administrativo" : "Entre para reservar"}
                        </h1>
                        <p className="text-olive-900/60 font-medium mt-3">
                            {isAdminLogin
                                ? "Identifique-se para gerenciar as configurações, o calendário e as reservas do sistema."
                                : "Para garantir sua segurança e agilizar sua reserva, entre com uma de suas contas sociais."
                            }
                        </p>
                    </div>
                </div>

                <LoginButtons />

                <div className="pt-8 text-center space-y-4 border-t border-gray-100 mt-10">
                    <p className="text-xs text-olive-900/40 font-medium leading-relaxed">
                        Ao continuar, você concorda com nossos <br />
                        <Link href="/termos" className="text-olive-900/60 hover:text-olive-900 underline transition-colors">Termos de Uso</Link> e
                        <Link href="/privacidade" className="text-olive-900/60 hover:text-olive-900 underline transition-colors ml-1">Política de Privacidade</Link>.
                    </p>
                </div>
            </div>

            <p className="mt-8 text-olive-900/30 font-bold text-xs tracking-widest uppercase">Casa Oliveira Direct Booking Engine</p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-sand-50 flex items-center justify-center font-bold text-olive-900">Iniciando...</div>}>
            <LoginContent />
        </Suspense>
    );
}
