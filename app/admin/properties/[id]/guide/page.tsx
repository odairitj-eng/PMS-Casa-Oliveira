"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    Trash2,
    Edit2,
    MoveUp,
    MoveDown,
    Save,
    ExternalLink,
    Info,
    Globe,
    Loader2,
    ChevronLeft,
    Settings,
    BookOpen
} from "lucide-react";
import Link from "next/link";
// @ts-ignore - Prisma types may take a moment to sync in IDE
import { SectionType, PlaceCategory } from "@prisma/client";

export default function PropertyGuideEditorPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params.id as string;

    const [guide, setGuide] = useState<any>(null);
    const [property, setProperty] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [guideRes, propRes] = await Promise.all([
                    fetch(`/api/admin/properties/${propertyId}/guide`),
                    fetch(`/api/admin/properties/${propertyId}`),
                ]);

                const guideData = await guideRes.json();
                const propData = await propRes.json();

                setGuide(guideData.id ? guideData : { propertyId, isActive: true, sections: [], places: [] });
                setProperty(propData);
            } catch (error) {
                console.error("Error fetching guide data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [propertyId]);

    const handleSaveGuide = async () => {
        try {
            setIsSaving(true);
            const res = await fetch(`/api/admin/properties/${propertyId}/guide`, {
                method: "POST",
                body: JSON.stringify({
                    isActive: guide.isActive,
                    accentColor: guide.accentColor,
                }),
            });
            if (res.ok) {
                const updatedGuide = await res.json();
                setGuide({ ...guide, ...updatedGuide });
                router.refresh();
            }
        } catch (error) {
            console.error("Error saving guide", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSection = async () => {
        try {
            const res = await fetch(`/api/admin/properties/${propertyId}/guide/sections`, {
                method: "POST",
                body: JSON.stringify({
                    type: "WELCOME",
                    title: "Nova Seção",
                    content: "Digite o conteúdo aqui...",
                }),
            });
            if (res.ok) {
                const newSection = await res.json();
                setGuide({
                    ...guide,
                    sections: [...guide.sections, newSection],
                });
            }
        } catch (error) {
            console.error("Error adding section", error);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm("Deseja realmente excluir esta seção?")) return;
        try {
            const res = await fetch(`/api/admin/properties/${propertyId}/guide/sections/${sectionId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setGuide({
                    ...guide,
                    sections: guide.sections.filter((s: any) => s.id !== sectionId),
                });
            }
        } catch (error) {
            console.error("Error deleting section", error);
        }
    };

    const handleAddPlace = async () => {
        try {
            const res = await fetch(`/api/admin/properties/${propertyId}/guide/places`, {
                method: "POST",
                body: JSON.stringify({
                    category: "RESTAURANT",
                    name: "Novo Local",
                    description: "Dica sobre o local...",
                }),
            });
            if (res.ok) {
                const newPlace = await res.json();
                setGuide({
                    ...guide,
                    places: [...guide.places, newPlace],
                });
            }
        } catch (error) {
            console.error("Error adding place", error);
        }
    };

    const handleDeletePlace = async (placeId: string) => {
        if (!confirm("Deseja realmente excluir este local?")) return;
        try {
            const res = await fetch(`/api/admin/properties/${propertyId}/guide/places/${placeId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setGuide({
                    ...guide,
                    places: guide.places.filter((p: any) => p.id !== placeId),
                });
            }
        } catch (error) {
            console.error("Error deleting place", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-olive-50/20">
                <Loader2 className="animate-spin text-olive-900" size={48} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto pb-32">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/guide"
                        className="w-10 h-10 rounded-full bg-white border border-olive-900/10 flex items-center justify-center text-olive-800 hover:bg-olive-50"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-olive-900">
                            Guia: {property?.name}
                        </h1>
                        <p className="text-olive-800/60 mt-1">Configure o manual digital do imóvel.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/guide/${propertyId}`} // Usando ID como token público para preview
                        target="_blank"
                        className="px-6 py-2 bg-white border border-olive-900/10 rounded-full text-xs font-bold uppercase tracking-widest text-olive-900 flex items-center gap-2 hover:bg-olive-50"
                    >
                        Visualizar <ExternalLink size={14} />
                    </Link>
                    <button
                        onClick={handleSaveGuide}
                        disabled={isSaving}
                        className="px-6 py-2 bg-olive-900 text-sand-50 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-olive-800 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        Salvar Configurações
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Config */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-olive-900/5 shadow-sm">
                        <h3 className="font-bold text-olive-900 mb-6 flex items-center gap-2">
                            <Settings size={18} className="text-olive-800" />
                            Configurações Gerais
                        </h3>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-olive-50/30 rounded-2xl cursor-pointer">
                                <span className="text-sm font-medium text-olive-900">Guia Ativado</span>
                                <input
                                    type="checkbox"
                                    checked={guide?.isActive}
                                    onChange={(e) => setGuide({ ...guide, isActive: e.target.checked })}
                                    className="w-5 h-5 accent-olive-900"
                                />
                            </label>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Cor de Destaque</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={guide?.accentColor || "#103020"}
                                        onChange={(e) => setGuide({ ...guide, accentColor: e.target.value })}
                                        className="w-10 h-10 rounded-lg cursor-pointer p-0 border-0 bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={guide?.accentColor || "#103020"}
                                        onChange={(e) => setGuide({ ...guide, accentColor: e.target.value })}
                                        className="flex-1 bg-olive-50/50 border border-olive-900/5 rounded-lg px-3 text-sm"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-sage-50/30 p-6 rounded-3xl border border-sage-400/10">
                        <h3 className="font-bold text-olive-900 mb-4 flex items-center gap-2">
                            <Info size={18} className="text-olive-800" />
                            Dica Pro
                        </h3>
                        <p className="text-sm text-olive-800/80 leading-relaxed">
                            O link do guia é enviado automaticamente aos hóspedes após a confirmação.
                            Mantenha as regras e instruções de check-in sempre atualizadas para reduzir o suporte no WhatsApp.
                        </p>
                    </div>
                </div>

                {/* Main Editor Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Seções Modulares */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-olive-900">Conteúdo do Guia</h2>
                            <button
                                onClick={handleAddSection}
                                className="p-2 bg-olive-900 text-sand-50 rounded-full hover:bg-olive-800 transition-all flex items-center gap-2 px-4 shadow-md"
                            >
                                <Plus size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Nova Seção</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {guide?.sections.length === 0 && (
                                <div className="bg-white border-2 border-dashed border-olive-900/10 p-12 text-center rounded-3xl">
                                    <BookOpen className="mx-auto text-olive-900/20 mb-4" size={48} />
                                    <p className="text-olive-800/40 font-medium">Nenhuma seção criada ainda.</p>
                                </div>
                            )}
                            {guide?.sections.map((section: any, index: number) => (
                                <div key={section.id} className="bg-white p-6 rounded-2xl border border-olive-900/5 shadow-sm group hover:border-olive-900/20 transition-all">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="bg-olive-50 text-olive-800 text-xs font-bold px-2 py-1 rounded-md">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-olive-900">{section.title}</h4>
                                                <span className="text-[10px] uppercase tracking-widest text-olive-800/40 font-bold">
                                                    {section.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-olive-800 hover:bg-olive-50 rounded-lg transition-all" title="Mover para Cima">
                                                <MoveUp size={16} />
                                            </button>
                                            <button className="p-2 text-olive-800 hover:bg-olive-50 rounded-lg transition-all" title="Mover para Baixo">
                                                <MoveDown size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-olive-800 hover:bg-olive-50 rounded-lg transition-all"
                                                onClick={() => router.push(`/admin/properties/${propertyId}/guide/sections/${section.id}`)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                onClick={() => handleDeleteSection(section.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Guia da Região */}
                    <div className="border-t border-olive-900/5 pt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-olive-900">Locais Recomendados</h2>
                            <button
                                onClick={handleAddPlace}
                                className="p-2 bg-olive-900/10 text-olive-900 rounded-full hover:bg-olive-900/20 transition-all flex items-center gap-2 px-4"
                            >
                                <Plus size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Novo Local</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {guide?.places.map((place: any) => (
                                <div key={place.id} className="bg-white p-5 rounded-2xl border border-olive-900/5 shadow-sm group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] uppercase tracking-widest text-olive-800/40 font-bold">{place.category}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-1.5 text-olive-800 hover:bg-olive-50 rounded-lg"
                                                onClick={() => router.push(`/admin/properties/${propertyId}/guide/places/${place.id}`)}
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                                onClick={() => handleDeletePlace(place.id)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-olive-900">{place.name}</h4>
                                    <p className="text-xs text-olive-800/60 mt-1">{place.distance}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
