"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, AlertCircle, TrendingUp, CalendarClock } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { cn } from "@/lib/utils";

const RULE_TYPES = [
    { value: 'WEEKEND_SURGE', label: 'Aumento de Fim de Semana', icon: TrendingUp },
    { value: 'LAST_MINUTE', label: 'Desconto Última Hora', icon: CalendarClock },
    { value: 'EARLY_BIRD', label: 'Desconto Antecipação', icon: TrendingUp },
    { value: 'SEASONAL', label: 'Ajuste Sazonal / Datas', icon: TrendingUp },
];

const PRESET_COLORS = [
    { name: 'Esmeralda', value: '#10b981' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Roxo', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Laranja', value: '#f59e0b' },
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Petróleo', value: '#064e3b' },
];

export default function AdminPricingPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [newRule, setNewRule] = useState<any>({
        type: 'WEEKEND_SURGE',
        value: 1.2,
        description: '',
        minDays: '',
        startDate: '',
        endDate: '',
        color: '#10b981'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [property, setProperty] = useState<any>(null);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            // 1. Buscar imóveis para ter um ID padrão
            const { data: properties } = await axios.get('/api/admin/properties');
            if (properties && properties.length > 0) {
                const defaultProperty = properties[0];
                setProperty(defaultProperty);

                // 2. Buscar dados do calendário para este imóvel
                const { data: calendarData } = await axios.get(`/api/calendar?propertyId=${defaultProperty.id}`);
                // O calendário retorna property, reservations, etc.
                if (calendarData.property) {
                    setProperty(calendarData.property);
                }

                // 3. Buscar as regras
                const resRules = await axios.get('/api/admin/pricing/rules');
                setRules(resRules.data);
            }
        } catch (error) {
            console.error("Erro ao carregar dados de pricing:", error);
            toast.error("Erro ao carregar configurações de preço.");
        }
    };

    const handleAddRule = async () => {
        setIsLoading(true);
        try {
            await axios.post('/api/admin/pricing/rules', {
                ...newRule,
                propertyId: property?.id
            });
            toast.success("Regra adicionada!");
            setNewRule({
                type: 'WEEKEND_SURGE',
                value: 1.2,
                description: '',
                minDays: '',
                startDate: '',
                endDate: '',
                color: '#10b981'
            });
            fetchRules();
        } catch (error) {
            toast.error("Erro ao adicionar regra.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRule = async (id: string) => {
        try {
            await axios.delete(`/api/admin/pricing/rules?id=${id}`);
            toast.success("Regra removida.");
            fetchRules();
        } catch (error) {
            toast.error("Erro ao remover regra.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-olive-900 leading-tight">Motor de Preços Inteligente</h1>
                    <p className="text-olive-900/60 font-medium">Automatize sua estratégia de preço com inteligência.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Adicionar Regra */}
                <Card className="lg:col-span-1 shadow-sm border border-olive-900/10 h-fit">
                    <CardHeader>
                        <CardTitle className="text-xl">Nova Regra Inteligente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="mb-2 block text-xs font-bold text-olive-900/60 uppercase">Tipo de Regra</Label>
                            <select
                                className="w-full rounded-lg border border-olive-900/10 p-2 text-sm focus:ring-olive-900/20"
                                value={newRule.type}
                                onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                            >
                                {RULE_TYPES.map(rt => (
                                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs font-bold text-olive-900/60 uppercase">Multiplicador (Ex: 1.2 = +20%)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={newRule.value}
                                onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                            />
                        </div>

                        {(newRule.type === 'LAST_MINUTE' || newRule.type === 'EARLY_BIRD') && (
                            <div>
                                <Label className="mb-2 block text-xs font-bold text-olive-900/60 uppercase">
                                    {newRule.type === 'LAST_MINUTE' ? 'Até quantos dias antes?' : 'A partir de quantos dias antes?'}
                                </Label>
                                <Input
                                    type="number"
                                    placeholder={newRule.type === 'LAST_MINUTE' ? "7" : "30"}
                                    value={newRule.minDays}
                                    onChange={(e) => setNewRule({ ...newRule, minDays: e.target.value })}
                                />
                            </div>
                        )}

                        {newRule.type === 'SEASONAL' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-2 block text-xs font-bold text-olive-900/60 uppercase">Início</Label>
                                    <Input
                                        type="date"
                                        value={newRule.startDate}
                                        onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-xs font-bold text-olive-900/60 uppercase">Fim</Label>
                                    <Input
                                        type="date"
                                        value={newRule.endDate}
                                        onChange={(e) => setNewRule({ ...newRule, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <Label className="mb-2 block text-xs font-bold text-olive-900/60 uppercase">Descrição (Opcional)</Label>
                            <Input
                                placeholder="Feriado de Inverno"
                                value={newRule.description}
                                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label className="mb-3 block text-xs font-bold text-olive-900/60 uppercase">Cor Identificadora</Label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setNewRule({ ...newRule, color: c.value })}
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 transition-all",
                                            newRule.color === c.value ? "border-olive-900 scale-110 shadow-md" : "border-transparent hover:scale-105"
                                        )}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleAddRule}
                            disabled={isLoading}
                            className="w-full bg-olive-900 hover:bg-olive-800 text-white font-bold h-11"
                        >
                            {isLoading ? "Salvando..." : "Ativar Regra Automática"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Listagem de Regras */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg text-olive-900">Regras Ativas Agora</h3>
                    {rules.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-olive-900/20 text-center text-olive-900/40">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma regra ativa. O sistema usará o preço base (R$ {property?.basePrice || "..."}).</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {rules.map((rule) => {
                                const ruleType = RULE_TYPES.find(r => r.value === rule.type);
                                const Icon = ruleType?.icon || TrendingUp;
                                return (
                                    <Card key={rule.id} className="shadow-sm border border-olive-900/10 hover:border-olive-900/30 transition-all overflow-hidden">
                                        <div className="h-1 w-full" style={{ backgroundColor: rule.color || '#10b981' }} />
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="p-3 rounded-xl"
                                                    style={{ backgroundColor: `${rule.color || '#10b981'}20` }}
                                                >
                                                    <Icon className="w-6 h-6" style={{ color: rule.color || '#10b981' }} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-olive-900">{ruleType?.label}</p>
                                                    <p className="text-sm text-olive-900/60">
                                                        {rule.value > 1 ? `Aumento de ${Math.round((rule.value - 1) * 100)}%` : `Desconto de ${Math.round((1 - rule.value) * 100)}%`}
                                                        {rule.description ? ` · ${rule.description}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="text-olive-900/30 hover:text-red-600"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
