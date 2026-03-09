"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Save, Loader2, Minus, Plus, Wand2, ArrowDownToLine, Zap } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export function PropertyForm({ property, onSave }: { property: any, onSave: (p: any) => Promise<void> }) {
    const [data, setData] = useState(property || {});
    const [isSaving, setIsSaving] = useState(false);
    const [airbnbUrl, setAirbnbUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);


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

    const handleImportAirbnb = async () => {
        if (!airbnbUrl || !airbnbUrl.includes("airbnb")) {
            toast.error("Por favor, insira uma URL válida do Airbnb.");
            return;
        }

        setIsImporting(true);
        const tid = toast.loading("Extraindo dados do Airbnb...");
        try {
            const response = await axios.post("/api/admin/properties/import-airbnb", { url: airbnbUrl });
            const importedData = response.data.data;

            // Merge com os dados existentes, dando prioridade aos importados
            setData({
                ...data,
                ...importedData
            });

            toast.success("Dados importados! Revise os campos abaixo.", { id: tid });
            setAirbnbUrl("");
        } catch (error: any) {
            console.error("ERRO AO IMPORTAR:", error);
            toast.error(error.response?.data?.error || "Falha na importação. Tente preenchimento manual.", { id: tid });
        } finally {
            setIsImporting(false);
        }
    };


    return (
        <Card className="shadow-sm border-olive-900/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Informações Principais</CardTitle>
                    <CardDescription>Nome, descrições, lotação e status de exibição.</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-olive-900/10 bg-olive-900/5">
                        <Label className="text-sm font-bold text-olive-900 cursor-pointer" htmlFor="is-active">Ativo</Label>
                        <input
                            id="is-active"
                            type="checkbox"
                            className="w-4 h-4 accent-olive-900 cursor-pointer"
                            checked={data.isActive ?? true}
                            onChange={(e) => setData({ ...data, isActive: e.target.checked })}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-olive-900 border hover:bg-olive-800 text-white gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar
                    </Button>
                </div>
            </CardHeader>

            {/* SEÇÃO DE IMPORTAÇÃO MÁGICA */}
            {!property?.id && (
                <div className="mx-6 mb-6 p-6 bg-gradient-to-br from-olive-900 via-olive-950 to-black rounded-[2rem] shadow-xl border border-white/10 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wand2 className="w-32 h-32 text-white" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-400 rounded-lg">
                                <Zap className="w-5 h-5 text-olive-900 fill-current" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight">Importação Mágica</h3>
                        </div>
                        <p className="text-white/60 text-sm font-medium max-w-md">
                            Cole o link do seu anúncio no **Airbnb** e nós preencheremos os nomes, descrições e capacidades para você instantaneamente.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="https://www.airbnb.com.br/rooms/..."
                                    className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-yellow-400/50 pl-4"
                                    value={airbnbUrl}
                                    onChange={(e) => setAirbnbUrl(e.target.value)}
                                    disabled={isImporting}
                                />
                            </div>
                            <Button
                                onClick={handleImportAirbnb}
                                disabled={isImporting}
                                className="h-14 px-8 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl gap-2 shadow-lg shadow-yellow-400/20 active:scale-95 transition-all"
                            >
                                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownToLine className="w-5 h-5" />}
                                Sincronizar Dados
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="space-y-2">
                        <Label>Nome do Anfitrião (Exibido no perfil)</Label>
                        <Input value={data.hostName || ""} onChange={(e) => setData({ ...data, hostName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug (Link da Página Pública)</Label>
                        <Input
                            value={data.slug || ""}
                            onChange={(e) => setData({ ...data, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            placeholder="ex: casa-oliveira-itjai"
                        />
                        <p className="text-[10px] text-olive-900/40">O link será: /<span>{data.slug || "..."}</span></p>
                    </div>
                    <div className="space-y-2">
                        <Label>Moeda</Label>
                        <Select
                            value={data.currency || "BRL"}
                            onValueChange={(v: string) => setData({ ...data, currency: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="BRL" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BRL">Real (BRL)</SelectItem>
                                <SelectItem value="USD">Dólar (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4 p-6 rounded-2xl border border-olive-900/10 bg-sand-50/20">
                    <h3 className="text-lg font-bold text-olive-900 border-b border-olive-900/10 pb-2">Tipo de propriedade</h3>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-olive-900/60 text-xs font-bold uppercase tracking-wider">Qual opção melhor representa o seu espaço?</Label>
                            <Select
                                value={data.category || "Casa"}
                                onValueChange={(v: string) => setData({ ...data, category: v })}
                            >
                                <SelectTrigger className="h-14 rounded-xl border-olive-900/20 bg-white text-lg font-medium">
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Casa">Casa</SelectItem>
                                    <SelectItem value="Apartamento">Apartamento</SelectItem>
                                    <SelectItem value="Chalé">Chalé</SelectItem>
                                    <SelectItem value="Pousada">Pousada</SelectItem>
                                    <SelectItem value="Villa">Villa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-olive-900/60 text-xs font-bold uppercase tracking-wider">Tipo de propriedade</Label>
                            <Select
                                value={data.propertyType || "HOUSE"}
                                onValueChange={(v: string) => setData({ ...data, propertyType: v })}
                            >
                                <SelectTrigger className="h-14 rounded-xl border-olive-900/20 bg-white text-lg font-medium">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HOUSE">Casa</SelectItem>
                                    <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                                    <SelectItem value="BUNGALOW">Bangalô</SelectItem>
                                    <SelectItem value="CABIN">Cabana</SelectItem>
                                    <SelectItem value="CHALET">Chalé</SelectItem>
                                    <SelectItem value="EARTH_HOUSE">Casa na terra</SelectItem>
                                    <SelectItem value="HUT">Casebre</SelectItem>
                                    <SelectItem value="LIGHTHOUSE">Torre de farol</SelectItem>
                                    <SelectItem value="VILLA">Vila</SelectItem>
                                    <SelectItem value="DOME_HOUSE">Casa de cúpula</SelectItem>
                                    <SelectItem value="FARMHOUSE">Casa de campo</SelectItem>
                                    <SelectItem value="FARM_HOTEL">Hotel-fazenda</SelectItem>
                                    <SelectItem value="HOUSEBOAT">Casa flutuante</SelectItem>
                                    <SelectItem value="TINY_HOUSE">Microcasa</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-olive-900/40 italic">Uma casa que pode ser independente ou ter paredes compartilhadas.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-olive-900/60 text-xs font-bold uppercase tracking-wider">Tipo de acomodação</Label>
                            <Select
                                value={data.accommodationType || "Espaço inteiro"}
                                onValueChange={(v: string) => setData({ ...data, accommodationType: v })}
                            >
                                <SelectTrigger className="h-14 rounded-xl border-olive-900/20 bg-white text-lg font-medium">
                                    <SelectValue placeholder="Selecione a acomodação" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Espaço inteiro">Espaço inteiro</SelectItem>
                                    <SelectItem value="Quarto privativo">Quarto privativo</SelectItem>
                                    <SelectItem value="Quarto compartilhado">Quarto compartilhado</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-olive-900/40 italic">Os hóspedes têm todo o lugar para si. Isso geralmente inclui um quarto, um banheiro e uma cozinha.</p>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <Label className="text-base font-bold text-olive-900">Quantos andares tem o prédio?</Label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setData({ ...data, buildingFloors: Math.max(1, (data.buildingFloors || 1) - 1) })}
                                    className="p-2 rounded-full border border-olive-900/20 hover:bg-olive-900/5 text-olive-900 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-bold min-w-[20px] text-center">{data.buildingFloors || 1}</span>
                                <button
                                    onClick={() => setData({ ...data, buildingFloors: (data.buildingFloors || 1) + 1 })}
                                    className="p-2 rounded-full border border-olive-900/20 hover:bg-olive-900/5 text-olive-900 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <Label className="text-base font-bold text-olive-900">Em que andar fica a acomodação?</Label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setData({ ...data, floorNumber: Math.max(0, (data.floorNumber || 0) - 1) })}
                                    className="p-2 rounded-full border border-olive-900/20 hover:bg-olive-900/5 text-olive-900 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-bold min-w-[20px] text-center">{data.floorNumber || 0}</span>
                                <button
                                    onClick={() => setData({ ...data, floorNumber: (data.floorNumber || 0) + 1 })}
                                    className="p-2 rounded-full border border-olive-900/20 hover:bg-olive-900/5 text-olive-900 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col justify-center px-4 rounded-xl border border-olive-900/20 bg-white h-14">
                                <Label className="text-[10px] uppercase font-bold text-olive-900/40">Ano de construção</Label>
                                <input
                                    type="number"
                                    className="bg-transparent border-none focus:ring-0 text-lg font-medium p-0"
                                    value={data.constructionYear || "2025"}
                                    onChange={(e) => setData({ ...data, constructionYear: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="md:col-span-2 flex gap-0 rounded-xl border border-olive-900/20 bg-white h-14">
                                <div className="flex-1 flex flex-col justify-center px-4 border-r border-olive-900/10">
                                    <Label className="text-[10px] uppercase font-bold text-olive-900/40">Tamanho da propriedade</Label>
                                    <input
                                        type="number"
                                        className="bg-transparent border-none focus:ring-0 text-lg font-medium p-0"
                                        value={data.propertySize || 0}
                                        onChange={(e) => setData({ ...data, propertySize: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <Select
                                        value={data.propertySizeUnit || "m²"}
                                        onValueChange={(v: string) => setData({ ...data, propertySizeUnit: v })}
                                    >
                                        <SelectTrigger className="h-full border-none rounded-none bg-olive-900/5 focus:ring-0 font-medium">
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <span className="text-[10px] uppercase font-bold text-olive-900/40">Unidade</span>
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="m²">m²</SelectItem>
                                            <SelectItem value="ft²">ft²</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-olive-900/40 italic">O espaço interno disponível para os hóspedes.</p>
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
                    <div className="space-y-2">
                        <Label>País</Label>
                        <Input value={data.country || "Brasil"} onChange={(e) => setData({ ...data, country: e.target.value })} />
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
