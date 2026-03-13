"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Save,
    Loader2,
    Trash2,
    Image as ImageIcon,
    Type,
    Globe
} from "lucide-react";
import Link from "next/link";
// @ts-ignore
import { SectionType } from "@prisma/client";

export default function SectionEditorPage() {
    const params = useParams();
    const router = useRouter();
    const { id: propertyId, sectionId } = params as { id: string, sectionId: string };

    const [section, setSection] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSection = async () => {
            try {
                const res = await fetch(`/api/admin/properties/${propertyId}/guide/sections/${sectionId}`);
                // Como não implementamos o GET individual na API, vamos buscar do guia geral ou implementar o GET
                // Por agora, vamos assumir que precisamos do GET individual para eficiência.
                // Vou ajustar a API para suportar GET individual se necessário, ou usar a geral.
                // BUSCANDO GERAL:
                const guideRes = await fetch(`/api/admin/properties/${propertyId}/guide`);
                const guideData = await guideRes.json();
                const found = guideData.sections.find((s: any) => s.id === sectionId);
                setSection(found);
            } catch (error) {
                console.error("Error fetching section", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSection();
    }, [propertyId, sectionId]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await fetch(`/api/admin/properties/${propertyId}/guide/sections/${sectionId}`, {
                method: "PATCH",
                body: JSON.stringify(section),
            });
            if (res.ok) {
                router.push(`/admin/properties/${propertyId}/guide`);
            }
        } catch (error) {
            console.error("Error saving section", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-olive-50/20">
                <Loader2 className="animate-spin text-olive-900" size={48} />
            </div>
        );
    }

    if (!section) return <div>Seção não encontrada.</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto pb-32">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white border border-olive-900/10 flex items-center justify-center text-olive-800 hover:bg-olive-50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-olive-900">Editar Seção</h1>
                        <p className="text-olive-800/60 mt-1">{section.title}</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-olive-900 text-sand-50 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-olive-800 disabled:opacity-50 shadow-lg"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Salvar Alterações
                </button>
            </header>

            <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-olive-900/5 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Tipo de Seção</label>
                            <select
                                value={section.type}
                                onChange={(e) => setSection({ ...section, type: e.target.value })}
                                className="w-full bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                            >
                                {Object.values(SectionType).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Título da Seção</label>
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => setSection({ ...section, title: e.target.value })}
                                className="w-full bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                                placeholder="Ex: Instruções de Check-in"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">URL da Imagem</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={section.imageUrl || ""}
                                onChange={(e) => setSection({ ...section, imageUrl: e.target.value })}
                                className="flex-1 bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                                placeholder="https://..."
                            />
                            <div className="w-12 h-12 bg-olive-50 rounded-2xl flex items-center justify-center text-olive-800 border border-olive-900/5 overflow-hidden">
                                {section.imageUrl ? <img src={section.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Conteúdo (Markdown)</label>
                        <textarea
                            value={section.content || ""}
                            onChange={(e) => setSection({ ...section, content: e.target.value })}
                            className="w-full bg-olive-50/50 border border-olive-900/5 rounded-3xl px-6 py-4 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none min-h-[300px]"
                            placeholder="Descreva as instruções aqui..."
                        />
                    </div>

                    {section.type === "WIFI" && (
                        <div className="bg-sage-50/20 p-6 rounded-3xl border border-sage-400/10 space-y-4">
                            <h4 className="font-bold text-olive-900 text-sm flex items-center gap-2">
                                <Globe size={16} /> Configurações de Wi-Fi
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-1">Nome da Rede (SSID)</label>
                                    <input
                                        type="text"
                                        value={section.config?.ssid || ""}
                                        onChange={(e) => setSection({
                                            ...section,
                                            config: { ...section.config, ssid: e.target.value }
                                        })}
                                        className="w-full bg-white border border-olive-900/5 rounded-xl px-4 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-1">Senha</label>
                                    <input
                                        type="text"
                                        value={section.config?.password || ""}
                                        onChange={(e) => setSection({
                                            ...section,
                                            config: { ...section.config, password: e.target.value }
                                        })}
                                        className="w-full bg-white border border-olive-900/5 rounded-xl px-4 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
