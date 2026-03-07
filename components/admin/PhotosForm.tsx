"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Props { propertyId: string; }

export function PhotosForm({ propertyId }: Props) {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUrl, setNewUrl] = useState("");

    useEffect(() => { fetchPhotos(); }, [propertyId]);

    const fetchPhotos = async () => {
        try {
            const { data } = await axios.get(`/api/admin/property/photos?propertyId=${propertyId}`);
            setPhotos(data);
        } catch { toast.error("Erro ao carregar fotos."); }
        finally { setLoading(false); }
    };

    const handleAdd = async () => {
        if (!newUrl) return;
        try {
            const res = await axios.post('/api/admin/property/photos', { imageUrl: newUrl, sortOrder: photos.length, propertyId });
            setPhotos([...photos, res.data]);
            setNewUrl("");
            toast.success("Foto adicionada!");
        } catch { toast.error("Erro ao adicionar."); }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/admin/property/photos?id=${id}`);
            setPhotos(photos.filter(p => p.id !== id));
            toast.success("Foto removida.");
        } catch { toast.error("Erro ao remover."); }
    };

    const handlePrimary = async (photo: any) => {
        try {
            await axios.post('/api/admin/property/photos', { ...photo, isPrimary: true, propertyId });
            fetchPhotos();
            toast.success("Destaque alterado.");
        } catch { toast.error("Erro ao atualizar."); }
    };

    return (
        <Card className="shadow-sm border-olive-900/10">
            <CardHeader>
                <CardTitle>Galeria de Fotos</CardTitle>
                <CardDescription>Gerencie as imagens exibidas no site. A primeira foto ativa será a principal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4 items-end bg-olive-900/5 p-4 rounded-xl border border-olive-900/10">
                    <div className="flex-1 space-y-2">
                        <Label>URL da Imagem</Label>
                        <Input placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                    </div>
                    <Button onClick={handleAdd} className="bg-olive-900 hover:bg-olive-800 text-white gap-2">
                        <Plus className="w-4 h-4" /> Adicionar
                    </Button>
                </div>

                {loading ? <p>Carregando...</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative group border rounded-xl overflow-hidden aspect-video bg-gray-100 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photo.imageUrl} alt="Property" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="icon" variant="destructive" onClick={() => handleDelete(photo.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    {!photo.isPrimary && (
                                        <Button size="icon" variant="secondary" onClick={() => handlePrimary(photo)}>
                                            <ImageIcon className="w-4 h-4 text-olive-900" />
                                        </Button>
                                    )}
                                </div>
                                {photo.isPrimary && (
                                    <div className="absolute top-2 left-2 bg-olive-900 text-white text-xs px-2 py-1 rounded-md font-bold">Principal</div>
                                )}
                            </div>
                        ))}
                        {photos.length === 0 && !loading && (
                            <p className="text-olive-900/50 col-span-3 text-center py-8">Nenhuma foto cadastrada.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
