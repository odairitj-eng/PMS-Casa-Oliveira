"use client";

import { useState } from "react";

interface PropertyDescriptionProps {
    shortDescription?: string | null;
    fullDescription?: string | null;
}

export function PropertyDescription({ shortDescription, fullDescription }: PropertyDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasContent = shortDescription || fullDescription;

    if (!hasContent) {
        return (
            <div id="a-casa" className="py-8 border-b border-olive-900/10 scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">Sobre este espaço</h2>
                <div className="text-olive-900/80 space-y-4 text-lg leading-relaxed">
                    Esta propriedade não possui descrição cadastrada.
                </div>
            </div>
        );
    }

    return (
        <div id="a-casa" className="py-8 border-b border-olive-900/10 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4">Sobre este espaço</h2>

            <div className={`text-olive-900/80 space-y-4 text-lg leading-relaxed whitespace-pre-line ${!isExpanded ? 'line-clamp-6 md:line-clamp-none' : ''
                }`}>
                {shortDescription}

                {fullDescription && (
                    <span className="block mt-4">{fullDescription}</span>
                )}
            </div>

            {/* O botão "Mostrar mais" só será visível em telas menores (até md) */}
            <div className="md:hidden mt-4">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="font-bold underline cursor-pointer hover:text-black flex items-center gap-1 text-olive-900 text-lg"
                >
                    {isExpanded ? "Mostrar menos" : "Mostrar mais"}
                </button>
            </div>
        </div>
    );
}
