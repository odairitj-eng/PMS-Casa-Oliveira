"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Save,
    Loader2,
    Image as ImageIcon,
    MapPin,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
// @ts-ignore
import { PlaceCategory } from "@prisma/client";

export default function PlaceEditorPage() {
    const params = useParams();
    const router = useRouter();
    const { id: propertyId, placeId } = params as { id: string, placeId: string };

    const [place, setPlace] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const guideRes = await fetch(`/api/admin/properties/${propertyId}/guide`);
                const guideData = await guideRes.json();
                const found = guideData.places.find((p: any) => p.id === placeId);
                setPlace(found);
            } catch (error) {
                console.error("Error fetching place", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [propertyId, placeId]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await fetch(`/api/admin/properties/${propertyId}/guide/places/${placeId}`, {
                method: "PATCH",
                body: JSON.stringify(place),
            });
            if (res.ok) {
                router.push(`/admin/properties/${propertyId}/guide`);
            }
        } catch (error) {
            console.error("Error saving place", error);
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

    if (!place) return <div>Local não encontrado.</div>;

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
                        <h1 className="text-3xl font-bold text-olive-900">Editar Local</h1>
                        <p className="text-olive-800/60 mt-1">{place.name}</p>
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
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Categoria</label>
                            <select
                                value={place.category}
                                onChange={(e) => setPlace({ ...place, category: e.target.value })}
                                className="w-full bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                            >
                                {Object.values(PlaceCategory).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Nome do Local</label>
                            <input
                                type="text"
                                value={place.name}
                                onChange={(e) => setPlace({ ...place, name: e.target.value })}
                                className="w-full bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                                placeholder="Ex: Restaurante do Porto"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Distância</label>
                            <input
                                type="text"
                                value={place.distance || ""}
                                onChange={(e) => setPlace({ ...place, distance: e.target.value })}
                                className="w-full bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                                placeholder="Ex: 500m ou 5 min caminhando"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Link Google Maps</label>
                            <input
                                type="text"
                                value={place.googleMapsUrl || ""}
                                onChange={(e) => setPlace({ ...place, googleMapsUrl: e.target.value })}
                                className="w-full bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                                placeholder="https://maps.google..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">URL da Imagem</label>
                        <input
                            type="text"
                            value={place.imageUrl || ""}
                            onChange={(e) => setPlace({ ...place, imageUrl: e.target.value })}
                            className="w-full bg-olive-50/50 border border-olive-900/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-olive-800/40 mb-2 ml-1">Descrição / Dica</label>
                        <textarea
                            value={place.description || ""}
                            onChange={(e) => setPlace({ ...place, description: e.target.value })}
                            className="w-full bg-olive-50/50 border border-olive-900/5 rounded-3xl px-6 py-4 text-sm focus:ring-2 focus:ring-olive-900/20 outline-none min-h-[100px]"
                            placeholder="Ex: Melhor bacalhau da região..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
