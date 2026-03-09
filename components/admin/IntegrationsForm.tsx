import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2, History } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props { propertyId: string; }

export function IntegrationsForm({ propertyId }: Props) {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [newUrl, setNewUrl] = useState("");
    const [newPlatform, setNewPlatform] = useState("AIRBNB");

    useEffect(() => { fetchIntegrations(); }, [propertyId]);

    const fetchIntegrations = async () => {
        try {
            const { data } = await axios.get(`/api/admin/property/integrations?propertyId=${propertyId}`);
            setIntegrations(data);
        } catch { toast.error("Erro ao carregar integrações."); }
        finally { setLoading(false); }
    };

    const handleAdd = async () => {
        if (!newUrl) return;
        try {
            const res = await axios.post('/api/admin/property/integrations', {
                propertyId,
                platform: newPlatform,
                icalUrl: newUrl
            });
            setIntegrations([...integrations, res.data]);
            setNewUrl("");
            toast.success("Integração adicionada!");
        } catch { toast.error("Erro ao adicionar."); }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/admin/property/integrations?id=${id}`);
            setIntegrations(integrations.filter(i => i.id !== id));
            toast.success("Integração removida.");
        } catch { toast.error("Erro ao remover."); }
    };

    const handleSync = async (id?: string) => {
        setSyncing(id || 'all');
        try {
            await axios.post('/api/calendar/sync', { propertyId });
            toast.success("Sincronização concluída!");
            fetchIntegrations();
        } catch {
            toast.error("Falha na sincronização.");
        } finally {
            setSyncing(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-olive-900/10">
                <CardHeader>
                    <CardTitle>Conectar Novo Canal</CardTitle>
                    <CardDescription>Adicione a URL do feed iCal do Airbnb ou Booking para sincronizar automaticamente as datas bloqueadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end bg-olive-900/5 p-4 rounded-xl border border-olive-900/10">
                        <div className="w-full md:w-48 space-y-2">
                            <Label>Plataforma</Label>
                            <select
                                value={newPlatform}
                                onChange={(e) => setNewPlatform(e.target.value)}
                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="AIRBNB">Airbnb</option>
                                <option value="BOOKING">Booking.com</option>
                                <option value="CHANNEX">Channex</option>
                            </select>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            <Label>URL iCal</Label>
                            <Input placeholder="https://www.airbnb.com.br/calendar/ical/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                        </div>
                        <Button onClick={handleAdd} disabled={!newUrl} className="bg-olive-900 hover:bg-olive-800 text-white gap-2 w-full md:w-auto">
                            <Plus className="w-4 h-4" /> Conectar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-olive-900/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Canais Conectados</CardTitle>
                        <CardDescription>Canais sincronizados com o calendário desta propriedade.</CardDescription>
                    </div>
                    {integrations.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync()}
                            disabled={!!syncing}
                            className="gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing === 'all' ? 'animate-spin' : ''}`} />
                            Sincronizar Tudo
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? <p className="text-center py-4 text-olive-900/50">Carregando...</p> : (
                        integrations.map((item) => (
                            <div key={item.id} className="group border rounded-2xl p-4 bg-white hover:border-olive-900/20 transition-all shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-olive-900/5 flex items-center justify-center text-olive-900 font-bold">
                                            {item.platform.substring(0, 1)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-olive-900">{item.platform}</h4>
                                            <p className="text-xs text-olive-900/40 truncate max-w-[200px] md:max-w-md font-mono">{item.icalUrl}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <div className="text-right mr-4 hidden md:block">
                                            <p className="text-[10px] uppercase font-bold text-olive-900/40">Última Sincronização</p>
                                            <p className="text-sm text-olive-900/80">
                                                {item.lastSyncAt ? format(new Date(item.lastSyncAt), "dd MMM, HH:mm", { locale: ptBR }) : "Nunca"}
                                            </p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleSync(item.id)}
                                            disabled={!!syncing}
                                            className="hover:bg-olive-900/5"
                                        >
                                            <RefreshCw className={`w-4 h-4 text-olive-900/60 ${syncing === item.id ? 'animate-spin' : ''}`} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {integrations.length === 0 && !loading && (
                        <div className="text-center py-12 bg-olive-900/5 rounded-2xl border border-dashed border-olive-900/20">
                            <AlertCircle className="w-8 h-8 text-olive-900/20 mx-auto mb-3" />
                            <p className="text-olive-900/50 font-medium">Nenhum canal externo conectado ainda.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-sm text-amber-900">
                    <p className="font-bold">Como funciona a sincronização?</p>
                    <p className="opacity-80">A Casa Oliveira verifica os canais conectados e bloqueia automaticamente as datas vendidas. Lembre-se de também exportar o link iCal da Casa Oliveira para esses canais para evitar overbooking bidirecional.</p>
                </div>
            </div>
        </div>
    );
}
