"use client";

import React, { useState } from "react";
import { Menu, X, BookOpen, Map, Info, User, Home, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideNavigationProps {
    sections: { id: string; title: string }[];
    isConcierge?: boolean;
}

export default function GuideNavigation({ sections, isConcierge }: GuideNavigationProps) {
    const [isOpen, setIsOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
        setIsOpen(false);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-white/90 backdrop-blur text-olive-900 border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] h-14 px-8 rounded-full flex items-center gap-2 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-white hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]"
                >
                    {isOpen ? <X size={16} /> : <Menu size={16} />}
                    {isOpen ? "Fechar" : "Índice"}
                </button>

                <button
                    onClick={scrollToTop}
                    className="bg-olive-900 text-sand-50 shadow-[0_20px_50px_-12px_rgba(44,52,31,0.3)] h-14 px-6 rounded-full flex items-center gap-2 active:scale-95 transition-all hover:shadow-[0_25px_60px_-15px_rgba(44,52,31,0.4)]"
                >
                    {isConcierge ? (
                        <>
                            <Home size={16} />
                            <span className="font-black uppercase tracking-widest text-[10px]">Início</span>
                        </>
                    ) : (
                        <ArrowUp size={16} />
                    )}
                </button>
            </div>

            {/* Navigation Overlay */}
            <div className={cn(
                "fixed inset-0 bg-[#F5EBE1]/98 z-40 transition-all duration-500 ease-in-out p-12 flex flex-col justify-center",
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <h2 className="font-editorial text-5xl text-olive-900 mb-12 opacity-80">Conteúdo</h2>

                <nav className="space-y-6 overflow-y-auto max-h-[70vh] pr-4">
                    {sections.map((section, index) => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className="group flex items-start gap-4 text-left w-full"
                        >
                            <span className="font-editorial text-lg text-olive-800/40 group-hover:text-olive-900 transition-colors">
                                {(index + 1).toString().padStart(2, '0')}.
                            </span>
                            <span className="font-editorial text-2xl text-olive-900 group-hover:translate-x-1 transition-transform border-b border-transparent group-hover:border-olive-900/20">
                                {section.title}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
}
