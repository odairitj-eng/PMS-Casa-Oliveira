"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Props { propertyId: string; }

export function RulesForm({ propertyId }: Props) {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newText, setNewText] = useState("");
    const [newIcon, setNewIcon] = useState("");

    useEffect(() => { fetchRules(); }, [propertyId]);

    const fetchRules = async () => {
        try {
            const { data } = await axios.get(`/api/admin/property/rules?propertyId=${propertyId}`);
            setRules(data);
        } catch { toast.error("Erro ao carregar regras."); }
        finally { setLoading(false); }
    };

    const handleAdd = async () => {
        if (!newText) return;
        try {
            const payload = { ruleText: newText, iconName: newIcon, sortOrder: rules.length, propertyId };
            const res = await axios.post('/api/admin/property/rules', payload);
            setRules([...rules, res.data]);
            setNewText(""); setNewIcon("");
            toast.success("Regra adicionada!");
        } catch { toast.error("Erro ao adicionar."); }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/admin/property/rules?id=${id}`);
            setRules(rules.filter(r => r.id !== id));
            toast.success("Regra removida.");
        } catch { toast.error("Erro ao remover."); }
    };

    return (
        <Card className="shadow-sm border-olive-900/10">
            <CardHeader>
                <CardTitle>Regras da Casa</CardTitle>
                <CardDescription>Deixe claro para seus hóspedes o que é e não é permitido durante a estadia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4 items-end bg-olive-900/5 p-4 rounded-xl border border-olive-900/10">
                    <div className="flex-1 space-y-2">
                        <Label>Regra</Label>
                        <Input placeholder="Ex: Proibido fumar nas áreas internas" value={newText} onChange={(e) => setNewText(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label>Ícone (Opcional)</Label>
                        <Input placeholder="Ex: CigaretteOff, Clock, PartyPopper" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
                    </div>
                    <Button onClick={handleAdd} className="bg-olive-900 hover:bg-olive-800 text-white gap-2">
                        <Plus className="w-4 h-4" /> Incluir
                    </Button>
                </div>

                <div className="space-y-2">
                    {loading ? <p>Carregando...</p> : (
                        rules.map(r => (
                            <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                                <div className="flex items-center gap-3 text-olive-900 font-medium">
                                    <ShieldAlert className="w-5 h-5 text-olive-900/50" />
                                    <span>{r.ruleText}</span>
                                    {r.iconName && <span className="text-sm px-2 py-0.5 bg-olive-900/10 rounded-full">{r.iconName}</span>}
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                    {rules.length === 0 && !loading && (
                        <p className="text-olive-900/50 text-center py-4">Nenhuma regra cadastrada ainda.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
