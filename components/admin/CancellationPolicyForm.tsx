"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Save, Loader2, Info } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const PRESET_POLICIES = [
    { name: "FLEXIBLE", label: "Flexível", freeLimit: 24, partial: 50, nonRefundable: 0 },
    { name: "MODERATE", label: "Moderada", freeLimit: 120, partial: 50, nonRefundable: 48 }, // 5 dias free, 50% até 2 dias
    { name: "STRICT", label: "Rigorosa", freeLimit: 336, partial: 50, nonRefundable: 168 }, // 14 dias free, 50% até 7 dias
    { name: "NON_REFUNDABLE", label: "Não Reembolsável", freeLimit: 0, partial: 0, nonRefundable: 0 },
];

export function CancellationPolicyForm({ propertyId, initialPolicy }: { propertyId: string, initialPolicy?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [policy, setPolicy] = useState(initialPolicy || {
        name: "MODERATE",
        cancelFreeLimitHours: 120,
        partialRefundPercentage: 50,
        nonRefundableLimitHours: 48,
        description: "Reembolso total até 5 dias antes. 50% até 48h antes."
    });

    const handleApplyPreset = (presetName: string) => {
        const preset = PRESET_POLICIES.find(p => p.name === presetName);
        if (preset) {
            let description = "";
            if (preset.name === "NON_REFUNDABLE") {
                description = "Esta reserva não permite reembolso após confirmada.";
            } else {
                description = `Cancelamento grátis até ${preset.freeLimit}h antes. Reembolso de ${preset.partial}% até ${preset.nonRefundable}h antes.`;
            }

            setPolicy({
                ...policy,
                name: preset.name,
                cancelFreeLimitHours: preset.freeLimit,
                partialRefundPercentage: preset.partial,
                nonRefundableLimitHours: preset.nonRefundable,
                description
            });
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await axios.post(`/api/admin/properties/${propertyId}/cancellation-policy`, policy);
            toast.success("Política de cancelamento salva!");
        } catch (error: any) {
            toast.error("Erro ao salvar política.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-sm border-olive-900/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Política de Cancelamento</CardTitle>
                    <CardDescription>Defina as regras de reembolso para esta propriedade.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={isLoading} className="bg-olive-900 hover:bg-olive-800 text-white gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Política
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Label>Atalhos de Políticas Comuns</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PRESET_POLICIES.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => handleApplyPreset(p.name)}
                                className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${policy.name === p.name ? 'border-olive-900 bg-olive-900/5 text-olive-900' : 'border-olive-900/10 hover:border-olive-900/30 text-olive-900/60'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                        <Label>Limite p/ Reembolso Total (Horas)</Label>
                        <Input
                            type="number"
                            value={policy.cancelFreeLimitHours}
                            onChange={(e) => setPolicy({ ...policy, cancelFreeLimitHours: parseInt(e.target.value) })}
                        />
                        <p className="text-[10px] text-olive-900/40">Ex: 120h = 5 dias antes do check-in.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Porcentagem Reembolso Parcial (%)</Label>
                        <Input
                            type="number"
                            value={policy.partialRefundPercentage}
                            onChange={(e) => setPolicy({ ...policy, partialRefundPercentage: parseInt(e.target.value) })}
                        />
                        <p className="text-[10px] text-olive-900/40">Geralmente 50%.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Limite p/ Reembolso Parcial (Horas)</Label>
                        <Input
                            type="number"
                            value={policy.nonRefundableLimitHours}
                            onChange={(e) => setPolicy({ ...policy, nonRefundableLimitHours: parseInt(e.target.value) })}
                        />
                        <p className="text-[10px] text-olive-900/40">Após este prazo, nada é reembolsado.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Descrição da Política (Exibida ao Hóspede)</Label>
                    <textarea
                        className="w-full min-h-[80px] rounded-xl border border-olive-900/10 p-4 text-sm focus:ring-olive-900/20"
                        value={policy.description || ""}
                        onChange={(e) => setPolicy({ ...policy, description: e.target.value })}
                        placeholder="Ex: Reembolso total até 5 dias antes..."
                    />
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold">Como funciona:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Check-in - 120h: Reembolso de 100%</li>
                            <li>120h até 48h: Reembolso de 50%</li>
                            <li>Menos de 48h: Sem reembolso</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
