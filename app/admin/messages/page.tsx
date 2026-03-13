"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    MessageSquare,
    Mail,
    Phone,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    History,
    Zap,
    Settings,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function MessageCenterPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const [templatesRes, logsRes] = await Promise.all([
                axios.get("/api/admin/messages/templates"),
                axios.get("/api/admin/messages/logs")
            ]);
            setTemplates(templatesRes.data);
            setLogs(logsRes.data);
        } catch (error) {
            toast.error("Erro ao carregar dados do Message Center");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "CHECKIN": return "bg-blue-100 text-blue-700";
            case "CHECKOUT": return "bg-purple-100 text-purple-700";
            case "PRE_CHECKIN": return "bg-amber-100 text-amber-700";
            case "DURING_STAY": return "bg-green-100 text-green-700";
            default: return "bg-sand-100 text-olive-900/60";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-olive-900 tracking-tight">Message Center</h1>
                    <p className="text-olive-900/60 font-medium">Gerencie templates e automações de comunicação</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => router.push("/admin/messages/templates/new")}
                        className="rounded-2xl bg-olive-900 hover:bg-olive-800 text-sand-50 h-12 px-6 font-bold shadow-lg flex gap-2"
                    >
                        <Plus className="w-5 h-5" /> Novo Template
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="templates" className="space-y-6">
                <TabsList className="bg-olive-900/5 p-1 rounded-2xl">
                    <TabsTrigger value="templates" className="rounded-xl px-6 py-2 content-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Templates
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 py-2 content-center gap-2">
                        <History className="w-4 h-4" /> Histórico de Envios
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-xl px-6 py-2 content-center gap-2">
                        <Settings className="w-4 h-4" /> Configurações
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-900/40" />
                            <Input
                                placeholder="Buscar templates..."
                                className="pl-12 h-12 rounded-2xl border-olive-900/10 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-olive-900/10 bg-white p-0">
                            <Filter className="w-4 h-4 text-olive-900/60" />
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-olive-900/20" />
                            <p className="text-olive-900/40 font-medium">Carregando templates...</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <Card className="rounded-[2.5rem] border-dashed border-2 bg-transparent p-20 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-olive-900/5 flex items-center justify-center mb-6">
                                <MessageSquare className="w-8 h-8 text-olive-900/20" />
                            </div>
                            <h3 className="text-xl font-bold text-olive-900 mb-2">Nenhum template encontrado</h3>
                            <p className="text-olive-900/40 max-w-sm mx-auto mb-8">
                                Crie seu primeiro template para agilizar a comunicação com seus hóspedes.
                            </p>
                            <Button
                                onClick={() => router.push("/admin/messages/templates/new")}
                                variant="outline"
                                className="rounded-xl border-olive-900/10"
                            >
                                Começar agora
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => (
                                <Card
                                    key={template.id}
                                    className="rounded-[2rem] border-0 shadow-xl overflow-hidden bg-white group hover:translate-y-[-4px] transition-all duration-300"
                                >
                                    <CardHeader className="p-6 border-b border-olive-900/5 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${template.channelType === 'EMAIL' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {template.channelType === 'EMAIL' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-bold text-olive-900 group-hover:text-olive-800 transition-colors">
                                                    {template.name}
                                                </CardTitle>
                                                <Badge variant="secondary" className={`mt-1 text-[10px] font-bold ${getCategoryColor(template.category)}`}>
                                                    {template.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        {template.isAutomatic && (
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center" title="Automático">
                                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-olive-900/60 text-sm line-clamp-3 mb-6 font-medium italic">
                                            "{template.body}"
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {template.isActive ? (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" /> Ativo
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-olive-900/30 uppercase tracking-widest">
                                                        <XCircle className="w-3 h-3" /> Inativo
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => router.push(`/admin/messages/templates/${template.id}`)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-10 h-10 rounded-xl hover:bg-olive-900/5 text-olive-900/40"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-red-50 text-red-500/40 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-olive-900/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-olive-900">Histórico de Comunicação</CardTitle>
                                <CardDescription>Acompanhe todos os disparos manuais e automáticos</CardDescription>
                            </div>
                            <Button variant="ghost" onClick={fetchTemplates} className="h-10 w-10 p-0 rounded-full hover:bg-olive-900/5">
                                <History className="w-5 h-5 text-olive-900/20" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {logs.length === 0 ? (
                                <div className="p-20 text-center text-olive-900/20 italic font-medium">
                                    Nenhuma mensagem registrada no histórico ainda.
                                </div>
                            ) : (
                                <div className="divide-y divide-olive-900/5">
                                    {logs.map((log: any) => (
                                        <div key={log.id} className="p-6 flex items-center justify-between hover:bg-olive-900/[0.01] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.channelType === 'EMAIL' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                    {log.channelType === 'EMAIL' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-olive-900">{log.guest.name}</div>
                                                    <div className="text-xs text-olive-900/40 font-medium">
                                                        {log.template?.name || "Mensagem Avulsa"} • {log.recipient}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-6">
                                                <div>
                                                    <div className="text-xs font-bold text-olive-900/60">
                                                        {new Date(log.sentAt).toLocaleDateString("pt-BR")}
                                                    </div>
                                                    <div className="text-[10px] text-olive-900/30 uppercase font-black tracking-tighter">
                                                        {new Date(log.sentAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <Badge className={`
                                                    font-bold text-[9px] border-0
                                                    ${log.status === 'SENT' ? 'bg-green-100 text-green-700' :
                                                        log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'}
                                                `}>
                                                    {log.status === 'SENT' ? 'ENVIADO' :
                                                        log.status === 'FAILED' ? 'FALHOU' :
                                                            'PENDENTE'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-olive-900/5">
                            <CardTitle className="text-xl font-bold text-olive-900">Configurações de Canais</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-olive-900 leading-none mb-1">WhatsApp Assisted</h4>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold text-[9px]">ATIVO</Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-olive-900/60 leading-relaxed font-medium">
                                        O sistema prepara as mensagens e gera links diretos para o WhatsApp do hóspede.
                                        Ideal para manter o toque pessoal em sua comunicação.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-xs font-bold text-olive-900/40">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Variáveis Dinâmicas
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold text-olive-900/40">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Links de Localização
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4 opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                            <Mail className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-olive-900 leading-none mb-1">E-mail (Resend)</h4>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold text-[9px]">CONFIGURADO</Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-olive-900/60 leading-relaxed font-medium">
                                        Envio automático de confirmações, guias e check-out 24/7.
                                        Atualmente utilizando o serviço Resend API.
                                    </p>
                                    <div className="pt-2 flex gap-3">
                                        <Button variant="outline" className="rounded-xl border-olive-900/10 text-xs font-bold h-9">
                                            Testar E-mail
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
