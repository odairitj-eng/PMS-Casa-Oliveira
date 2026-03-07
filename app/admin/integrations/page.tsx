"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Trash2, Globe, ExternalLink, HardDriveDownload, CheckCircle2, History } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [newIntegration, setNewIntegration] = useState({ platform: 'AIRBNB', icalUrl: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const { data } = await axios.get('/api/admin/integrations');
            setIntegrations(data);
        } catch (error) {
            toast.error("Erro ao carregar integrações.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddIntegration = async () => {
        if (!newIntegration.icalUrl) {
            toast.error("Insira a URL do iCal.");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.post('/api/admin/integrations', newIntegration);
            toast.success("Integração adicionada com sucesso!");
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
        toast.success("Link copiado para a área de transferência!");
    };

    const exportUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/ical/export/casa-oliveira-token`;

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold text-olive-900">Integrações (Channel Manager)</h1>
                <p className="text-olive-900/60 font-medium">Sincronize calendários com Airbnb e Booking.com via iCal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Exportação */}
                <Card className="shadow-sm border-olive-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-olive-900" />
                            Exportar Calendário
                        </CardTitle>
                        <CardDescription>Use este link para enviar a disponibilidade da Casa Oliveira para outros sites.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-sand-50 rounded-xl border border-olive-900/10 flex items-center justify-between gap-3">
                            <code className="text-xs truncate text-olive-900/70">{exportUrl}</code>
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(exportUrl)} className="shrink-0">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-olive-900/60 leading-relaxed font-medium">
                            * Copie e cole este link nas configurações de &quot;Sincronização&quot; (Importar) do seu Airbnb ou Booking.
                        </p>
                    </CardContent>
                </Card>

                {/* Importação Form */}
                <Card className="shadow-sm border-olive-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDriveDownload className="w-5 h-5 text-olive-900" />
                            Importar Calendário
                        </CardTitle>
                        <CardDescription>Conecte uma fonte externa para bloquear datas automaticamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                                <select
                                    className="w-full h-10 px-3 rounded-lg border border-olive-900/10 text-sm focus:ring-olive-900/20"
                                    value={newIntegration.platform}
                                    onChange={(e) => setNewIntegration({ ...newIntegration, platform: e.target.value })}
                                >
                                    <option value="AIRBNB">Airbnb</option>
                                    <option value="BOOKING">Booking</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Input
                                    placeholder="URL iCal (https://...)"
                                    value={newIntegration.icalUrl}
                                    onChange={(e) => setNewIntegration({ ...newIntegration, icalUrl: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-olive-900" onClick={handleAddIntegration} disabled={isSubmitting}>
                            {isSubmitting ? "Conectando..." : "Conectar Calendário Externo"}
                        </Button>
                    </CardContent>
                </Card>

            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg text-olive-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Canais Sincronizados
                </h3>

                {integrations.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-olive-900/20 text-center text-olive-900/40">
                        Nenhuma integração ativa. Conecte seu primeiro calendário.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {integrations.map((item) => (
                            <Card key={item.id} className="shadow-sm border-olive-900/10 hover:border-olive-900/30 transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-olive-900/5 p-3 rounded-xl">
                                            <Globe className="w-6 h-6 text-olive-900" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-olive-900">{item.platform}</p>
                                                <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">ATIVA</span>
                                            </div>
                                            <p className="text-xs text-olive-900/40 truncate max-w-md">{item.icalUrl}</p>
                                            <p className="text-[10px] text-olive-900/60 mt-1 font-medium flex items-center gap-1">
                                                <History className="w-3 h-3" />
                                                Última sincronização: {item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleString('pt-BR') : 'Nunca'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            disabled={syncingId === item.id}
                                            onClick={() => handleSync(item.id)}
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${syncingId === item.id ? 'animate-spin' : ''}`} />
                                            Sync
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
