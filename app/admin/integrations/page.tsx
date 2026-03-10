"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Trash2, Globe, ExternalLink, HardDriveDownload, CheckCircle2, History, Zap, ShieldCheck, Building, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from "react";

function IntegrationsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [integrations, setIntegrations] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(searchParams.get('propertyId'));
    const [channexId, setChannexId] = useState('');
    const [isUpdatingChannex, setIsUpdatingChannex] = useState(false);
    const [newIntegration, setNewIntegration] = useState({ platform: 'AIRBNB', icalUrl: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPropsLoading, setIsPropsLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'api' | 'ical'>('api');

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (selectedPropertyId) {
            fetchIntegrations();
        }
    }, [selectedPropertyId]);

    const fetchProperties = async () => {
        try {
            const { data } = await axios.get('/api/admin/properties');
            setProperties(data);
            if (data.length > 0) {
                const initialId = selectedPropertyId || data[0].id;
                const prop = data.find((p: any) => p.id === initialId) || data[0];
                setSelectedPropertyId(prop.id);
                setChannexId(prop.channexId || '');
                if (!selectedPropertyId) {
                    router.replace(`/admin/integrations?propertyId=${prop.id}`);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar imóveis:", error);
        } finally {
            setIsPropsLoading(false);
        }
    };

    const fetchIntegrations = async () => {
        if (!selectedPropertyId) return;
        setIsLoading(true);
        try {
            const { data } = await axios.get(`/api/admin/integrations?propertyId=${selectedPropertyId}`);
            setIntegrations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar integrações:", error);
            // Evita toast genérico que pode causar o "1 error" se o erro não for uma string
            toast.error("Falha ao carregar integrações.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedPropertyId(id);
        const prop = properties.find(p => p.id === id);
        setChannexId(prop?.channexId || '');
        router.push(`/admin/integrations?propertyId=${id}`);
    };

    const handleUpdateChannexId = async () => {
        if (!selectedPropertyId) return;
        setIsUpdatingChannex(true);
        try {
            await axios.patch('/api/admin/properties', { id: selectedPropertyId, channexId });
            toast.success("ID Channex atualizado!");
            // Atualiza a lista local de propriedades para refletir a mudança
            setProperties(properties.map(p => p.id === selectedPropertyId ? { ...p, channexId } : p));
        } catch (error) {
            toast.error("Erro ao salvar ID Channex.");
        } finally {
            setIsUpdatingChannex(false);
        }
    };

    const handleAddIntegration = async () => {
        if (!newIntegration.icalUrl) {
            toast.error("Insira a URL do iCal.");
            return;
        }
        if (!selectedPropertyId) {
            toast.error("Selecione um imóvel primeiro.");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.post('/api/admin/integrations', {
                ...newIntegration,
                propertyId: selectedPropertyId
            });
            toast.success("Integração adicionada!");
            setNewIntegration({ platform: 'AIRBNB', icalUrl: '' });
            fetchIntegrations();
        } catch (error) {
            toast.error("Erro ao adicionar integração.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/admin/integrations?id=${id}`);
            toast.success("Integração removida.");
            fetchIntegrations();
        } catch (error) {
            toast.error("Erro ao remover.");
        }
    };

    const handleSync = async (id: string) => {
        setSyncingId(id);
        const tid = toast.loading("Sincronizando calendário...");
        try {
            await axios.post('/api/admin/integrations/sync', { integrationId: id });
            toast.success("Calendário sincronizado!", { id: tid });
            fetchIntegrations();
        } catch (error) {
            toast.error("Erro na sincronização.", { id: tid });
        } finally {
            setSyncingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Link copiado!");
    };

    const exportUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/ical/export/${selectedPropertyId || 'casa-oliveira-token'}.ics`;

    if (isPropsLoading) {
        return <div className="p-12 text-center text-olive-900/40">Carregando imóveis...</div>;
    }

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-olive-900/5 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-olive-900">Integrações e Sincronização</h1>
                    <p className="text-olive-900/60 font-medium font-serif">Gerencie como sua casa se comunica com Airbnb, Booking e outros.</p>
                </div>

                <div className="relative inline-block w-full md:w-[480px]">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-900/40 z-10" />
                    <select
                        className="w-full bg-sand-50/50 border border-olive-900/10 rounded-2xl h-12 pl-11 pr-10 text-olive-900 font-bold text-sm focus:ring-2 focus:ring-olive-900/20 appearance-none shadow-sm transition-all hover:bg-sand-50"
                        value={selectedPropertyId || ""}
                        onChange={handlePropertyChange}
                    >
                        <option value="" disabled>Selecione um imóvel...</option>
                        {properties.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-900/40 pointer-events-none" />
                </div>
            </div>

            {/* Navegação por Abas */}
            <div className="flex p-1.5 bg-white border border-olive-900/5 rounded-2xl w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab('api')}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2",
                        activeTab === 'api'
                            ? "bg-olive-900 text-sand-50 shadow-lg shadow-olive-900/20"
                            : "text-olive-900/40 hover:text-olive-900 hover:bg-sand-50/50"
                    )}
                >
                    <Zap className={cn("w-4 h-4", activeTab === 'api' ? "text-yellow-400" : "text-olive-900/40")} />
                    Configurações da API
                </button>
                <button
                    onClick={() => setActiveTab('ical')}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2",
                        activeTab === 'ical'
                            ? "bg-olive-900 text-sand-50 shadow-lg shadow-olive-900/20"
                            : "text-olive-900/40 hover:text-olive-900 hover:bg-sand-50/50"
                    )}
                >
                    <Copy className="w-4 h-4" />
                    Conexões iCal
                </button>
            </div>

            {activeTab === 'api' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-gradient-to-br from-olive-900 to-olive-950 text-sand-50">
                        <CardContent className="p-8 md:p-12">
                            <div className="flex flex-col lg:flex-row gap-12 items-center">
                                <div className="flex-1 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sand-50/10 rounded-full border border-sand-50/20 backdrop-blur-sm">
                                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-black uppercase tracking-widest">Recomendado: API Profit</span>
                                    </div>
                                    <h2 className="text-4xl font-black leading-tight tracking-tight">
                                        Sincronização API <br /> <span className="text-sand-50/60">Profissional Real-Time</span>
                                    </h2>
                                    <p className="text-sand-50/70 text-lg font-medium leading-relaxed max-w-xl">
                                        Utilize a tecnologia da <span className="text-sand-50 font-bold underline decoration-yellow-400/50 underline-offset-4">Channex.io</span> para bloquear datas instantaneamente no Airbnb e Booking.com ao receber uma reserva direta.
                                    </p>

                                    <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20 backdrop-blur-md max-w-md space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sand-50/60 text-[10px] font-black uppercase tracking-widest block">ID da Propriedade na Channex</Label>
                                                <button className="text-[9px] text-sand-50/40 hover:text-sand-50 transition-colors underline uppercase font-black" onClick={() => toast("Este ID é fornecido pela Channex.io no painel da sua propriedade.", { icon: 'ℹ️' })}>
                                                    Onde encontrar?
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={channexId}
                                                    onChange={(e) => setChannexId(e.target.value)}
                                                    placeholder="Ex: 550e8400-e29b-..."
                                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-11"
                                                />
                                                <Button
                                                    onClick={handleUpdateChannexId}
                                                    disabled={isUpdatingChannex}
                                                    className="bg-sand-50 text-olive-900 hover:bg-white rounded-xl h-11 font-bold px-4 transition-all active:scale-95 shadow-lg shadow-black/20"
                                                >
                                                    {isUpdatingChannex ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Salvar"}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-sand-50/40 mt-2 font-bold px-1">
                                                * Este ID é necessário para que o Webhook identifique qual imóvel bloquear.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                            <ShieldCheck className="w-6 h-6 text-green-400" />
                                            <span className="text-sm font-bold">Zero Overbooking</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                            <RefreshCw className="w-6 h-6 text-blue-400" />
                                            <span className="text-sm font-bold">Feedback API 2s</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => window.open('https://app.channex.io/', '_blank')}
                                        className="h-14 px-8 rounded-2xl bg-sand-50 text-olive-900 hover:bg-white font-black text-lg shadow-xl shadow-black/20 group cursor-pointer"
                                    >
                                        Criar Conta na Channex
                                        <ExternalLink className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                                <div className="lg:w-1/3 flex justify-center">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-sand-50/10 blur-3xl rounded-full"></div>
                                        <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-[3rem] border border-white/20 shadow-2xl">
                                            <Zap className="w-24 h-24 text-sand-50 opacity-40" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Exportação */}
                        <Card className="rounded-[2.5rem] shadow-xl border-olive-900/5 bg-white">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="flex items-center gap-4 text-2xl font-black text-olive-900">
                                    <div className="p-3 bg-olive-900/5 rounded-2xl">
                                        <Globe className="w-6 h-6 text-olive-900" />
                                    </div>
                                    Exportar Calendário
                                </CardTitle>
                                <CardDescription className="text-olive-900/60 font-medium font-serif italic">Envie a disponibilidade para outros sites via arquivo iCal.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                <div className="p-4 bg-sand-50/80 rounded-2xl border-2 border-dashed border-olive-900/10 flex items-center justify-between gap-4 transition-colors hover:border-olive-900/20">
                                    <code className="text-[10px] sm:text-xs truncate text-olive-900/60 font-mono font-bold">{exportUrl}</code>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(exportUrl)} title="Clique para copiar o link" className="shrink-0 rounded-xl hover:bg-olive-900/10 active:scale-95 transition-all">
                                        <Copy className="w-4 h-4 text-olive-900" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-olive-900/40 font-bold uppercase tracking-wider px-1">
                                    Copia este link e cola no Airbnb/Booking para sincronizar.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Importação Form */}
                        <Card className="rounded-[2.5rem] shadow-xl border-olive-900/5 bg-white">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="flex items-center gap-4 text-2xl font-black text-olive-900">
                                    <div className="p-3 bg-olive-900/5 rounded-2xl">
                                        <HardDriveDownload className="w-6 h-6 text-olive-900" />
                                    </div>
                                    Importar Calendário
                                </CardTitle>
                                <CardDescription className="text-olive-900/60 font-medium font-serif italic">Bloqueie datas automaticamente ao receber reservas externas.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-1">
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-olive-900/10 text-sm font-bold bg-sand-50 focus:ring-2 focus:ring-olive-900/20 transition-all outline-none text-olive-900"
                                            value={newIntegration.platform}
                                            onChange={(e) => setNewIntegration({ ...newIntegration, platform: e.target.value })}
                                        >
                                            <option value="AIRBNB">Airbnb</option>
                                            <option value="BOOKING">Booking</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Input
                                            placeholder="URL do iCal..."
                                            className="h-12 rounded-xl border-olive-900/10 bg-sand-50 focus-visible:ring-olive-900/20 font-medium"
                                            value={newIntegration.icalUrl}
                                            onChange={(e) => setNewIntegration({ ...newIntegration, icalUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="h-12 w-full bg-olive-900 hover:bg-olive-800 text-sand-50 rounded-xl font-black text-sm shadow-lg shadow-olive-900/10 transition-all active:scale-[0.98]"
                                    onClick={handleAddIntegration}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <HardDriveDownload className="w-4 h-4 mr-2" />}
                                    {isSubmitting ? "Sincronizando..." : "Conectar e Validar Calendário"}
                                </Button>
                                <p className="text-[10px] text-olive-900/30 text-center font-bold">
                                    Nota: O iCal pode levar até 15 minutos para refletir mudanças.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-black text-2xl text-olive-900 flex items-center gap-3 px-2">
                            <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                            Conexões Ativas
                        </h3>

                        {isLoading ? (
                            <div className="bg-white p-12 rounded-[2.5rem] border border-olive-900/5 text-center text-olive-900/40 font-bold uppercase tracking-widest animate-pulse">
                                Buscando conexões...
                            </div>
                        ) : integrations.length === 0 ? (
                            <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-olive-900/10 text-center space-y-4 shadow-inner">
                                <div className="bg-olive-900/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-olive-900/20">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <p className="font-black text-olive-900/30 text-lg">Nenhuma integração iCal ativa.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {integrations.map((item) => (
                                    <Card key={item.id} className="rounded-[2rem] border border-olive-900/5 hover:border-olive-900 shadow-sm transition-all bg-white group overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                                                <div className="p-6 flex items-center gap-6 flex-1">
                                                    <div className="relative">
                                                        <div className="bg-olive-900 p-4 rounded-2xl shadow-lg shadow-olive-900/20 transform transition-transform group-hover:scale-110">
                                                            <Globe className="w-6 h-6 text-sand-50" />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="font-black text-xl text-olive-900 tracking-tight">{item.platform}</p>
                                                            <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase tracking-wider">Online</span>
                                                        </div>
                                                        <p className="text-[11px] text-olive-900/40 font-mono truncate max-w-xs md:max-w-md">{item.icalUrl}</p>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-sand-50/50 sm:bg-transparent flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 sm:border-l border-olive-900/5">
                                                    <div className="text-right mr-4 hidden md:block">
                                                        <p className="text-[10px] font-black text-olive-900/30 uppercase tracking-widest mb-1">Última Sync</p>
                                                        <p className="text-xs font-bold text-olive-900/60 flex items-center gap-1.5 justify-end">
                                                            <History className="w-3.5 h-3.5" />
                                                            {item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleString('pt-BR') : 'Aguardando...'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <Button
                                                            variant="outline"
                                                            size="lg"
                                                            className="h-12 rounded-xl font-black text-sm gap-2 border-olive-900/10 hover:bg-white flex-1 sm:flex-none shadow-sm"
                                                            disabled={syncingId === item.id}
                                                            onClick={() => handleSync(item.id)}
                                                        >
                                                            <RefreshCw className={cn("w-4 h-4", syncingId === item.id && "animate-spin")} />
                                                            Sincronizar
                                                        </Button>
                                                        <Button size="icon" className="h-12 w-12 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-100" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function IntegrationsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-olive-900/40">Carregando painel...</div>}>
            <IntegrationsContent />
        </Suspense>
    );
}
