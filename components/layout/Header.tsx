"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/admin");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // No painel admin, usaremos a barra lateral existente para o menu de usuário por enquanto
    if (isAdminPage) return null;

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            e.preventDefault();
            const headerOffset = 100; // Ajuste para o tamanho do header fixo
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // Opcional: atualiza a URL sem recarregar
            window.history.pushState(null, '', `#${id}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-olive-900/5 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-32 flex justify-between items-center">
                <Link href="/" className="hover:opacity-80 transition-all active:scale-95">
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-olive-900/5">
                        <Image
                            src="/imagens/logo.png"
                            alt="Casa Oliveira"
                            width={100}
                            height={100}
                            className="object-contain w-16 h-16 md:w-20 md:h-20"
                            priority
                        />
                    </div>
                </Link>

                <div className="flex items-center gap-4 md:gap-6">
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="#a-casa"
                            onClick={(e) => handleScroll(e, 'a-casa')}
                            className="text-sm font-bold text-olive-900/60 hover:text-olive-900 transition-colors"
                        >
                            A Casa
                        </Link>
                        <Link
                            href="#comodidades"
                            onClick={(e) => handleScroll(e, 'comodidades')}
                            className="text-sm font-bold text-olive-900/60 hover:text-olive-900 transition-colors"
                        >
                            Comodidades
                        </Link>
                        <Link
                            href="#localizacao"
                            onClick={(e) => handleScroll(e, 'localizacao')}
                            className="text-sm font-bold text-olive-900/60 hover:text-olive-900 transition-colors"
                        >
                            Localização
                        </Link>
                        <Link
                            href="#regras"
                            onClick={(e) => handleScroll(e, 'regras')}
                            className="text-sm font-bold text-olive-900/60 hover:text-olive-900 transition-colors"
                        >
                            Regras da Casa
                        </Link>
                    </nav>

                    <div className="h-8 w-[1px] bg-olive-900/10 hidden md:block" />

                    <div className="flex items-center gap-2">
                        <UserMenu />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-olive-900 md:hidden hover:bg-olive-900/5 rounded-xl transition-colors"
                            aria-label="Menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={cn(
                "fixed inset-0 z-[150] bg-sand-50 transition-all duration-500 md:hidden flex flex-col",
                isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
            )}>
                <div className="p-6 flex justify-between items-center border-b border-olive-900/5 bg-white/50">
                    <div className="rounded-xl overflow-hidden shadow-sm border border-olive-900/5">
                        <Image
                            src="/imagens/logo.png"
                            alt="Casa Oliveira"
                            width={50}
                            height={50}
                            className="object-contain w-10 h-10"
                        />
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-3 bg-olive-900/5 rounded-2xl text-olive-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-12 px-8 flex flex-col gap-10">
                    <Link
                        href="#a-casa"
                        onClick={(e) => handleScroll(e, 'a-casa')}
                        className="text-3xl font-black text-olive-900 tracking-tight"
                    >
                        A Casa
                    </Link>
                    <Link
                        href="#comodidades"
                        onClick={(e) => handleScroll(e, 'comodidades')}
                        className="text-3xl font-black text-olive-900 tracking-tight"
                    >
                        Comodidades
                    </Link>
                    <Link
                        href="#localizacao"
                        onClick={(e) => handleScroll(e, 'localizacao')}
                        className="text-3xl font-black text-olive-900 tracking-tight"
                    >
                        Localização
                    </Link>
                    <Link
                        href="#regras"
                        onClick={(e) => handleScroll(e, 'regras')}
                        className="text-3xl font-black text-olive-900 tracking-tight"
                    >
                        Regras da Casa
                    </Link>

                    <div className="mt-4 pt-8 border-t border-olive-900/5 flex flex-col gap-4">
                        <p className="text-sm font-bold text-olive-900/40 uppercase tracking-widest">Contato</p>
                        <a href="tel:+5547999820528" className="text-xl font-bold text-olive-900">+55 47 99982-0528</a>
                    </div>
                </div>
            </div>
        </header>
    );
}
