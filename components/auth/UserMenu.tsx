"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, LayoutDashboard, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserMenu() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fecha o menu ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (status === "loading") return <div className="w-10 h-10 rounded-full bg-olive-900/10 animate-pulse" />;

    if (status === "unauthenticated") {
        return (
            <Link href="/auth/login">
                <Button className="bg-olive-900 text-sand-50 rounded-full px-6 font-bold hover:bg-olive-800 transition-all shadow-md">
                    Entrar
                </Button>
            </Link>
        );
    }

    const user = session?.user;
    const isAdmin = (user as any)?.role === "ADMIN";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-olive-900/10 hover:shadow-md transition-all bg-white overflow-hidden ring-2 ring-transparent active:ring-olive-900/20"
            >
                {user?.image ? (
                    <Image
                        src={user.image}
                        alt={user.name || "Usuário"}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-olive-900 flex items-center justify-center text-sand-50 font-bold">
                        {user?.name?.[0].toUpperCase() || "U"}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-olive-900/5 py-4 z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-olive-900/5 mb-2">
                        <p className="font-bold text-olive-900 text-lg truncate">{user?.name}</p>
                        <p className="text-xs text-olive-900/50 font-medium truncate">{user?.email}</p>
                        {isAdmin && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-olive-900 text-[10px] text-sand-50 font-bold rounded-lg uppercase tracking-wider">
                                Administrador
                            </span>
                        )}
                    </div>

                    <div className="px-2 space-y-1">
                        {isAdmin ? (
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-olive-900/70 hover:text-olive-900 hover:bg-olive-900/5 rounded-2xl transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Painel PMS
                            </Link>
                        ) : (
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-olive-900/70 hover:text-olive-900 hover:bg-olive-900/5 rounded-2xl transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <History className="w-5 h-5" />
                                Minhas Reservas
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-olive-900/70 hover:text-olive-900 hover:bg-olive-900/5 rounded-2xl transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-5 h-5" />
                                Configurações
                            </Link>
                        )}

                        <div className="pt-2 mt-2 border-t border-olive-900/5">
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all text-left"
                            >
                                <LogOut className="w-5 h-5" />
                                Sair da conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
