"use client";

import { useState, useEffect } from "react";
import {
    Save,
    ArrowLeft,
    Zap,
    Mail,
    Phone,
    MessageSquare,
    Info,
    Type,
    Clock,
    ChevronDown,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

const CATEGORIES = [
    "PRE_CHECKIN", "CHECKIN", "DURING_STAY", "CHECKOUT", "POST_CHECKOUT",
    "MARKETING", "VIP", "BILLING", "REMINDER", "SUPPORT", "GENERAL"
];

const PLACEHOLDERS = [
    { key: "{{guest_name}}", label: "Nome do Hóspede" },
    { key: "{{property_name}}", label: "Nome do Imóvel" },
    { key: "{{checkin_date}}", label: "Data de Check-in" },
    { key: "{{checkout_date}}", label: "Data de Check-out" },
    { key: "{{checkin_time}}", label: "Horário Check-in" },
    { key: "{{checkout_time}}", label: "Horário Check-out" },
    { key: "{{reservation_id}}", label: "ID da Reserva" },
    { key: "{{total_amount}}", label: "Valor Total" },
    { key: "{{guide_url}}", label: "Link do Guia Digital" },
    { key: "{{wifi_name}}", label: "Nome do Wi-Fi" },
    { key: "{{wifi_password}}", label: "Senha do Wi-Fi" },
];

interface MessageTemplateEditorProps {
    templateId?: string;
}

export function MessageTemplateEditor({ templateId }: MessageTemplateEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(!!templateId);
    const [isSaving, setIsSaving] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        category: "GENERAL",
        channelType: "WHATSAPP",
        subject: "",
        body: "",
        isActive: true,
        isAutomatic: false,
        propertyId: "ALL",
        triggerType: "RESERVATION_CONFIRMED",
        triggerOffsetValue: 0,
        triggerOffsetUnit: "DAYS",
    });

    useEffect(() => {
        const fetchProps = async () => {
            try {
                const res = await axios.get("/api/admin/properties");
                setProperties(res.data);
            } catch (error) {
                console.error("Erro ao carregar imóveis");
            }
        };
        fetchProps();

        if (templateId) {
            const fetchTemplate = async () => {
                try {
                    const res = await axios.get(`/api/admin/messages/templates/${templateId}`);
                    setFormData({
                        ...res.data,
                        propertyId: res.data.propertyId || "ALL"
                    });
                } catch (error) {
                    toast.error("Erro ao carregar template");
                    router.push("/admin/messages");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTemplate();
        }
    }, [templateId]);

    const handleSave = async () => {
        if (!formData.name || !formData.body) {
            return toast.error("Preencha o nome e o corpo da mensagem");
        }

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                propertyId: formData.propertyId === "ALL" ? null : formData.propertyId
            };

            if (templateId) {
                await axios.patch(`/api/admin/messages/templates/${templateId}`, payload);
                toast.success("Template atualizado!");
            } else {
                await axios.post("/api/admin/messages/templates", payload);
                toast.success("Template criado!");
            }
            router.push("/admin/messages");
        } catch (error) {
            toast.error("Erro ao salvar template");
        } finally {
            setIsSaving(true);
        }
    };

    const insertPlaceholder = (key: string) => {
        setFormData(prev => ({
            ...prev,
            body: prev.body + " " + key
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-olive-900/20" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
            <div className="xl:col-span-2 space-y-6">
                <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-olive-900/5 bg-sand-50/30">
                        <div className="flex items-center gap-4 mb-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/admin/messages")}
                                className="w-10 h-10 rounded-full hover:bg-olive-900/5"
                            >
                                <ArrowLeft className="w-5 h-5 text-olive-900/60" />
                            </Button>
                            <CardTitle className="text-2xl font-bold text-olive-900">
                                {templateId ? "Editar Template" : "Novo Template"}
                            </CardTitle>
                        </div>
                        <CardDescription className="ml-14 font-medium">Configure o conteúdo e canal da sua mensagem profissional</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Nome do Template</Label>
                                <Input
                                    placeholder="Ex: Boas-vindas (Check-in)"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="rounded-xl border-olive-900/10 h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Categoria</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger className="rounded-xl border-olive-900/10 h-12">
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-olive-900/10">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Para qual Imóvel?</Label>
                                <Select
                                    value={formData.propertyId}
                                    onValueChange={(val) => setFormData({ ...formData, propertyId: val })}
                                >
                                    <SelectTrigger className="rounded-xl border-olive-900/10 h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-olive-900/10">
                                        <SelectItem value="ALL">Todos os Imóveis</SelectItem>
                                        {properties.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Canal de Envio</Label>
                                <div className="flex p-1 bg-olive-900/5 rounded-xl h-12">
                                    <button
                                        onClick={() => setFormData({ ...formData, channelType: "WHATSAPP" })}
                                        className={`flex-1 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${formData.channelType === 'WHATSAPP' ? 'bg-white text-green-600 shadow-sm' : 'text-olive-900/40'}`}
                                    >
                                        <Phone className="w-3.5 h-3.5" /> WhatsApp
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, channelType: "EMAIL" })}
                                        className={`flex-1 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${formData.channelType === 'EMAIL' ? 'bg-white text-blue-600 shadow-sm' : 'text-olive-900/40'}`}
                                    >
                                        <Mail className="w-3.5 h-3.5" /> E-mail
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-olive-900/10 h-12 bg-sand-50/30">
                                    <Label className="text-xs font-bold text-olive-900/60 cursor-pointer">Status Ativo</Label>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(val: boolean) => setFormData({ ...formData, isActive: val })}
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.channelType === 'EMAIL' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Assunto do E-mail</Label>
                                <Input
                                    placeholder="Ex: Boas-vindas à Casa Oliveira!"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="rounded-xl border-olive-900/10 h-12"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Corpo da Mensagem</Label>
                                <Badge variant="secondary" className="text-[10px] font-bold bg-olive-900/5 text-olive-900/40 border-0">
                                    Suporta Variáveis
                                </Badge>
                            </div>
                            <Textarea
                                placeholder="Escreva sua mensagem aqui..."
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                className="min-h-[300px] rounded-[2rem] border-olive-900/10 p-6 text-olive-900 font-medium leading-relaxed resize-none focus:ring-olive-900/20"
                            />

                            <div className="p-6 rounded-[2rem] bg-olive-900/5 border border-olive-900/10 space-y-4">
                                <div className="flex items-center gap-2 text-olive-900/60 mb-2">
                                    <Type className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Variáveis Dinâmicas</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {PLACEHOLDERS.map(p => (
                                        <button
                                            key={p.key}
                                            onClick={() => insertPlaceholder(p.key)}
                                            className="px-3 py-1.5 rounded-lg bg-white border border-olive-900/10 text-[10px] font-bold text-olive-900/60 hover:bg-olive-900 hover:text-white hover:border-olive-900 transition-all shadow-sm flex items-center gap-2"
                                        >
                                            {p.label} <span className="opacity-40">{p.key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-olive-900/5 bg-amber-50/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                                <CardTitle className="text-xl font-bold text-olive-900">Automação Inteligente</CardTitle>
                            </div>
                            <Switch
                                checked={formData.isAutomatic}
                                onCheckedChange={(val: boolean) => setFormData({ ...formData, isAutomatic: val })}
                            />
                        </div>
                        <CardDescription className="ml-9 font-medium">Configure gatilhos para disparo automático</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {!formData.isAutomatic ? (
                            <div className="py-8 text-center space-y-4">
                                <Clock className="w-12 h-12 text-olive-900/10 mx-auto" />
                                <p className="text-sm text-olive-900/40 font-medium max-w-[250px] mx-auto leading-relaxed">
                                    Ative a automação para que o sistema envie esta mensagem de forma independente.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Evento de Gatilho</Label>
                                    <Select
                                        value={formData.triggerType || "RESERVATION_CONFIRMED"}
                                        onValueChange={(val) => setFormData({ ...formData, triggerType: val as any })}
                                    >
                                        <SelectTrigger className="rounded-xl border-olive-900/10 h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-olive-900/10">
                                            <SelectItem value="RESERVATION_CONFIRMED">Reserva Confirmada (Imediato)</SelectItem>
                                            <SelectItem value="CHECKIN_DATE">Baseado no Check-in</SelectItem>
                                            <SelectItem value="CHECKOUT_DATE">Baseado no Check-out</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.triggerType !== 'RESERVATION_CONFIRMED' && (
                                    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-olive-900/40 ml-1">Antecedência/Atraso</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                value={formData.triggerOffsetValue}
                                                onChange={(e) => setFormData({ ...formData, triggerOffsetValue: parseInt(e.target.value) })}
                                                className="rounded-xl border-olive-900/10 h-12 w-20"
                                            />
                                            <Select
                                                value={formData.triggerOffsetUnit}
                                                onValueChange={(val) => setFormData({ ...formData, triggerOffsetUnit: val as any })}
                                            >
                                                <SelectTrigger className="rounded-xl border-olive-900/10 h-12 flex-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-olive-900/10">
                                                    <SelectItem value="MINUTES">Minutos antes</SelectItem>
                                                    <SelectItem value="HOURS">Horas antes</SelectItem>
                                                    <SelectItem value="DAYS">Dias antes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-olive-900 text-sand-50 sticky top-6">
                    <CardHeader className="p-8 border-b border-white/10">
                        <CardTitle className="text-xl font-bold">Publicar Template</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                Vínculo por Imóvel
                            </div>
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                Validação de Variáveis
                            </div>
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                Logs de Auditoria
                            </div>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full h-14 rounded-2xl bg-white text-olive-900 hover:bg-sand-100 font-bold flex items-center justify-center gap-3 shadow-lg"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Salvar Template
                                </>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => router.push("/admin/messages")}
                            className="w-full h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold"
                        >
                            Descartar Alterações
                        </Button>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white border border-olive-900/5">
                    <CardHeader className="p-8 border-b border-olive-900/5">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-olive-900/40" />
                            <CardTitle className="text-sm font-bold text-olive-900 uppercase tracking-widest">Dica Profissional</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <p className="text-sm text-olive-900/60 leading-relaxed font-medium">
                            Use as variáveis para criar uma experiência personalizada. Hóspedes adoram ser chamados pelo nome e ter todos os dados da estadia (como instruções de Wi-Fi) à mão assim que chegam.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
