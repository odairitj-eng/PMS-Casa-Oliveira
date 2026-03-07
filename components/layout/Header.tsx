"use client";

import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/admin");

    // No painel admin, usaremos a barra lateral existente para o menu de usuário por enquanto
    // ou podemos adicionar um topo limpo se desejar. Mantendo para páginas públicas.
    if (isAdminPage) return null;

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
        if (pathname !== "/") return; // Se não estiver na home, deixa o Link do Next.js funcionar normalmente
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100; // Ajuste para o tamanho do header fixo
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-olive-900/5 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-32 flex justify-between items-center">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <Image
                        src="/imagens/logo.png"
                        alt="Casa Oliveira"
                        width={120}
                        height={120}
                        className="object-contain"
                    />
                </Link>

                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/#a-casa"
                            onClick={(e) => handleScroll(e, 'a-casa')}
                            className="text-sm font-bold text-olive-900/60 hover:text-olive-900 transition-colors"
                        >
                            A Casa
                        </Link>
                        <Link
                            href="/#comodidades"
                            onClick={(e) => handleScroll(e, 'comodidades')}
                            className="text-sm font-bold text-olive-900/60 hover:text-olive-900 transition-colors"
                        >
                            Comodidades
                        </Link>
                        <Link
                            href="/#localizacao"
                            onClick={(e) => handleScroll(e, 'localizacao')}
                            className="text-sm font-bold text-olive-900/60 hover:text-olive-900 transition-colors"
                        >
                            Localização
                        </Link>
                    </nav>

                    <div className="h-8 w-[1px] bg-olive-900/10 hidden md:block" />

                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
