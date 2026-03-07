"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export function PropertyForm({ property, onSave }: { property: any, onSave: (p: any) => Promise<void> }) {
    const [data, setData] = useState(property || {});
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(data);
            toast.success("Informações salvas com sucesso!");
        } catch (error: any) {
            console.error("ERRO AO SALVAR:", error);
            const msg = error.response?.data?.error || "Erro ao salvar informações.";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="shadow-sm border-olive-900/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Informações Principais</CardTitle>
                    <CardDescription>Nome, descrições, lotação e localização para exibição pública.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-olive-900 border hover:bg-olive-800 text-white gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Nome Interno (Admin)</Label>
                        <Input value={data.name || ""} onChange={(e) => setData({ ...data, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Título Público do Anúncio</Label>
                        <Input value={data.publicTitle || ""} onChange={(e) => setData({ ...data, publicTitle: e.target.value })} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Subtítulo do Anúncio (Opcional)</Label>
                    <Input value={data.publicSubtitle || ""} onChange={(e) => setData({ ...data, publicSubtitle: e.target.value })} />
                </div>

                <div className="space-y-2">
                    <Label>Descrição Curta</Label>
                    <textarea
                        className="w-full min-h-[80px] rounded-xl border border-olive-900/10 p-4 text-sm focus:ring-olive-900/20"
                        value={data.shortDescription || ""}
                        onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Descrição Completa</Label>
                    <textarea
                        className="w-full min-h-[160px] rounded-xl border border-olive-900/10 p-4 text-sm focus:ring-olive-900/20"
                        value={data.fullDescription || ""}
                        onChange={(e) => setData({ ...data, fullDescription: e.target.value })}
                    />
                </div>

                <h3 className="text-lg font-semibold pt-4 border-t">Hóspedes e Cômodos</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Máximo Hóspedes</Label>
                        <Input type="number" value={data.maxGuests || 0} onChange={(e) => setData({ ...data, maxGuests: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Quartos</Label>
                        <Input type="number" value={data.bedrooms || 0} onChange={(e) => setData({ ...data, bedrooms: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Camas</Label>
                        <Input type="number" value={data.beds || 0} onChange={(e) => setData({ ...data, beds: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Banheiros</Label>
                        <Input type="number" value={data.bathrooms || 0} onChange={(e) => setData({ ...data, bathrooms: parseInt(e.target.value) })} />
                    </div>
                </div>

                {/* Bloco de Configuração de Animais de Estimação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-xl border border-olive-900/10 bg-sand-50/30">
                    <div className="flex flex-col justify-center gap-2">
                        <Label className="text-base font-semibold">Aceita Animais de Estimação?</Label>
                        <p className="text-sm text-olive-900/60">Permite que hóspedes adicionem pets ao número de viajantes no momento da reserva.</p>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-olive-900 cursor-pointer"
                                checked={data.allowsPets || false}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setData({ ...data, allowsPets: checked, maxPets: checked ? (data.maxPets || 1) : 0 });
                                }}
                            />
                            <Label className="cursor-pointer font-medium">{data.allowsPets ? "Sim, aceitamos pets" : "Não permitimos pets"}</Label>
                        </div>
                    </div>

                    {data.allowsPets && (
                        <div className="space-y-2 flex flex-col justify-center">
                            <Label>Máximo de Animais</Label>
                            <Input
                                type="number"
                                min={1}
                                className="max-w-[150px]"
                                value={data.maxPets || 1}
                                onChange={(e) => setData({ ...data, maxPets: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold pt-4 border-t">Localização Detalhada</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                        <Label>Logradouro (Rua/Avenida)</Label>
                        <Input value={data.street || ""} onChange={(e) => setData({ ...data, street: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Número</Label>
                        <Input value={data.streetNumber || ""} onChange={(e) => setData({ ...data, streetNumber: e.target.value })} />
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input value={data.neighborhood || ""} onChange={(e) => setData({ ...data, neighborhood: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input value={data.postalCode || ""} onChange={(e) => setData({ ...data, postalCode: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input value={data.city || ""} onChange={(e) => setData({ ...data, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Estado (UF)</Label>
                        <Input value={data.state || ""} onChange={(e) => setData({ ...data, state: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-olive-900/10 bg-sand-50/20">
                    <div className="space-y-4">
                        <Label className="text-base font-bold">Coordenadas Exatas (Admin)</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-olive-900/40">Latitude</Label>
                                <Input type="number" step="any" value={data.latitude ?? ""} onChange={(e) => setData({ ...data, latitude: e.target.value === "" ? null : parseFloat(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-olive-900/40">Longitude</Label>
                                <Input type="number" step="any" value={data.longitude ?? ""} onChange={(e) => setData({ ...data, longitude: e.target.value === "" ? null : parseFloat(e.target.value) })} />
                            </div>
                        </div>
                        <p className="text-[10px] text-olive-900/40 italic">Usadas para o mapa exato após reserva confirmada.</p>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base font-bold">Coordenadas Públicas (Aproximadas)</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-olive-900/40">Latitude Pública</Label>
                                <Input type="number" step="any" value={data.publicLatitude ?? ""} onChange={(e) => setData({ ...data, publicLatitude: e.target.value === "" ? null : parseFloat(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-olive-900/40">Longitude Pública</Label>
                                <Input type="number" step="any" value={data.publicLongitude ?? ""} onChange={(e) => setData({ ...data, publicLongitude: e.target.value === "" ? null : parseFloat(e.target.value) })} />
                            </div>
                        </div>
                        <p className="text-[10px] text-olive-900/40 italic">Usadas para o mapa público no anúncio (Preserva privacidade).</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Texto de Localização (Exibição no Cabeçalho)</Label>
                    <Input placeholder="Ex: Campos do Jordão, São Paulo, Brasil" value={data.locationText || ""} onChange={(e) => setData({ ...data, locationText: e.target.value })} />
                </div>

                <h3 className="text-lg font-semibold pt-4 border-t">Preços e Taxas Padrão</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Preço por Noite Padrão (R$)</Label>
                        <Input type="number" value={data.basePrice || 0} onChange={(e) => setData({ ...data, basePrice: parseFloat(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Taxa de Limpeza Base (R$)</Label>
                        <Input type="number" value={data.cleaningFee || 0} onChange={(e) => setData({ ...data, cleaningFee: parseFloat(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Mínimo de Noites Base</Label>
                        <Input type="number" value={data.minimumNights || 2} onChange={(e) => setData({ ...data, minimumNights: parseInt(e.target.value) })} />
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
