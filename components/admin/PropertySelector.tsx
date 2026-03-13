"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, Check, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Property {
    id: string;
    name: string;
    isActive: boolean;
}

export function PropertySelector() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const propertyId = params.id as string;

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await fetch("/api/admin/properties");
                if (res.ok) {
                    const data = await res.json();
                    setProperties(data);

                    if (propertyId) {
                        const current = data.find((p: Property) => p.id === propertyId);
                        if (current) setCurrentProperty(current);
                    }
                }
            } catch (error) {
                console.error("Error fetching properties for selector", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, [propertyId]);

    // Fechar ao clicar fora
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = () => setIsOpen(false);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, [isOpen]);

    if (isLoading) return <div className="w-48 h-10 bg-olive-900/5 animate-pulse rounded-xl" />;

    // Se não estiver em uma rota de propriedade específica, mostrar apenas "Selecionar Imóvel" se houver múltiplos
    if (!propertyId && properties.length <= 1) return null;

    const ActiveProperty = currentProperty || properties[0];

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-olive-900/5 hover:bg-olive-900/10 rounded-2xl transition-all border border-olive-900/5 group"
            >
                <div className="w-8 h-8 rounded-lg bg-olive-900 text-sand-50 flex items-center justify-center shadow-sm">
                    <Building2 size={16} />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-bold text-olive-900/40 uppercase tracking-widest leading-none mb-1">Imóvel Atual</p>
                    <p className="text-sm font-bold text-olive-900 truncate max-w-[150px]">
                        {ActiveProperty?.name || "Selecionar..."}
                    </p>
                </div>
                <ChevronDown size={16} className={cn("text-olive-900/30 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-olive-900/5 overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
                    <div className="p-2 border-b border-olive-900/5 bg-olive-50/30">
                        <p className="px-3 py-2 text-[10px] font-bold text-olive-800/40 uppercase tracking-widest">Seus Imóveis</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                        {properties.map((p) => {
                            const isCurrent = p.id === propertyId;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        // Tentar manter a sub-rota se possível (ex: /guide, /settings)
                                        const subPath = pathname.split(propertyId)[1] || "";
                                        router.push(`/admin/properties/${p.id}${subPath}`);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                        isCurrent
                                            ? "bg-olive-900 text-sand-50 shadow-md"
                                            : "text-olive-900 hover:bg-olive-50"
                                    )}
                                >
                                    <span className="truncate">{p.name}</span>
                                    {isCurrent && <Check size={14} />}
                                </button>
                            );
                        })}
                    </div>
                    <Link href="/admin/properties/new" onClick={() => setIsOpen(false)}>
                        <div className="p-2 border-t border-olive-900/5 bg-olive-50/10">
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-olive-800 hover:bg-olive-900 hover:text-sand-50 transition-all text-xs font-bold uppercase tracking-widest">
                                <Plus size={14} /> Novo Imóvel
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
