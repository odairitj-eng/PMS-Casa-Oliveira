"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Props { propertyId: string; }

export function AmenitiesForm({ propertyId }: Props) {
    const [amenities, setAmenities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newIcon, setNewIcon] = useState("");

    useEffect(() => { fetchAmenities(); }, [propertyId]);

    const fetchAmenities = async () => {
        try {
            const { data } = await axios.get(`/api/admin/property/amenities?propertyId=${propertyId}`);
            setAmenities(data);
        } catch { toast.error("Erro ao carregar comodidades."); }
        finally { setLoading(false); }
    };

    const handleAdd = async () => {
        if (!newName) return;
        try {
            const payload = {
                amenityKey: newName.toLowerCase().replace(/ /g, '_'),
                amenityName: newName,
                iconName: newIcon,
                sortOrder: amenities.length,
                propertyId,
            };
            const res = await axios.post('/api/admin/property/amenities', payload);
            setAmenities([...amenities, res.data]);
            setNewName(""); setNewIcon("");
            toast.success("Comodidade adicionada!");
        } catch { toast.error("Erro ao adicionar."); }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/admin/property/amenities?id=${id}`);
            setAmenities(amenities.filter(a => a.id !== id));
            toast.success("Comodidade removida.");
        } catch { toast.error("Erro ao remover."); }
    };

    return (
        <Card className="shadow-sm border-olive-900/10">
            <CardHeader>
                <CardTitle>Comodidades e Atributos</CardTitle>
                <CardDescription>Liste os pontos fortes do seu anúncio, como WiFi, Piscina, Estacionamento, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4 items-end bg-olive-900/5 p-4 rounded-xl border border-olive-900/10">
                    <div className="flex-1 space-y-2">
                        <Label>Nome da Comodidade</Label>
                        <Input placeholder="Ex: Wi-Fi Rápido" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label>Ícone (Nome Lucide opcional)</Label>
                        <Input placeholder="Ex: Wifi, Tv, Wind" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
                    </div>
                    <Button onClick={handleAdd} className="bg-olive-900 hover:bg-olive-800 text-white gap-2">
                        <Plus className="w-4 h-4" /> Incluir
                    </Button>
                </div>

                <div className="space-y-2">
                    {loading ? <p>Carregando...</p> : (
                        amenities.map(a => (
                            <div key={a.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                                <div className="flex items-center gap-3 text-olive-900 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-olive-900/50" />
                                    <span>{a.amenityName}</span>
                                    {a.iconName && <span className="text-sm px-2 py-0.5 bg-olive-900/10 rounded-full">{a.iconName}</span>}
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                    {amenities.length === 0 && !loading && (
                        <p className="text-olive-900/50 text-center py-4">Nenhuma comodidade cadastrada ainda.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
