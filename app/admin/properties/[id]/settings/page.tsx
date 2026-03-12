"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Building2, CreditCard, Share2, Mail, Save, Loader2,
    Image as ImageIcon, Map, FileCheck, DownloadCloud, ArrowLeft, ExternalLink, Plug
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

import { PropertyForm } from "@/components/admin/PropertyForm";
import { PhotosForm } from "@/components/admin/PhotosForm";
import { AmenitiesForm } from "@/components/admin/AmenitiesForm";
import { RulesForm } from "@/components/admin/RulesForm";
import { ImportForm } from "@/components/admin/ImportForm";
import { IntegrationsForm } from "@/components/admin/IntegrationsForm";
import { CancellationPolicyForm } from "@/components/admin/CancellationPolicyForm";

type Tab = 'geral' | 'fotos' | 'comodidades' | 'regras' | 'importar' | 'integracoes' | 'financeiro' | 'contato';

export default function PropertySettingsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const propertyId = params?.id as string;

    const [activeTab, setActiveTab] = useState<Tab>('geral');
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSystem, setIsSavingSystem] = useState(false);
    const [propertyData, setPropertyData] = useState<any>(null);
    const [systemSettings, setSystemSettings] = useState<any>({
        mercadoPagoPublicKey: "",
        mercadoPagoAccessToken: "",
        whatsappNumber: "",
        contactEmail: "",
    });

    useEffect(() => {
        fetchData();
    }, [propertyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [propRes, settRes] = await Promise.all([
                axios.get(`/api/admin/properties/${propertyId}`),
                axios.get('/api/admin/settings')
            ]);
            setPropertyData(propRes.data);
            if (settRes.data.settings) setSystemSettings(settRes.data.settings);
        } catch {
            toast.error("Erro ao carregar dados.");
            router.push('/admin/properties');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProperty = async (data: any) => {
        await axios.patch(`/api/admin/properties/${propertyId}`, data);
        setPropertyData((prev: any) => ({ ...prev, ...data }));
    };

    const handleSaveSystem = async () => {
        setIsSavingSystem(true);
        try {
            await axios.post('/api/admin/settings', { settings: systemSettings, property: null });
            toast.success("Configurações globais salvas!");
        } catch {
            toast.error("Erro ao salvar configurações globais.");
        } finally {
            setIsSavingSystem(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-olive-900" />
            </div>
        );
    }

    const TAB_BTN = (tab: Tab, label: string, Icon: any) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-900/60 hover:text-olive-900/80'}`}
        >
            <Icon className="w-4 h-4" /> {label}
        </button>
    );

    return (
        <div className="space-y-6 max-w-5xl pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] shadow-lg border border-olive-900/5">
                <Link href="/admin/properties">
                    <button className="p-2 rounded-xl hover:bg-olive-900/5 text-olive-900/60 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-olive-900">
                        {propertyData?.publicTitle || propertyData?.name || 'Configurações do Imóvel'}
                    </h1>
                    <p className="text-olive-900/50 text-sm font-mono">/{propertyData?.slug}</p>
                </div>
                {propertyData?.slug && (
                    <a href={`/${propertyData.slug}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm font-bold text-olive-700 hover:text-olive-900 transition-colors">
                        <ExternalLink className="w-4 h-4" /> Ver página pública
                    </a>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-olive-900/5 rounded-2xl w-full overflow-x-auto no-scrollbar">
                {TAB_BTN('importar', 'Importar Airbnb', DownloadCloud)}
                <div className="w-[1px] h-6 bg-olive-900/20 my-auto mx-2 hidden md:block" />
                {TAB_BTN('geral', 'Imóvel & Detalhes', Building2)}
                {TAB_BTN('fotos', 'Fotos', ImageIcon)}
                {TAB_BTN('comodidades', 'Comodidades', Map)}
                {TAB_BTN('regras', 'Regras', FileCheck)}
                <div className="w-[1px] h-6 bg-olive-900/20 my-auto mx-2 hidden md:block" />
                {TAB_BTN('integracoes', 'Integrações', Plug)}
                {TAB_BTN('financeiro', 'Financeiro', CreditCard)}
                {TAB_BTN('contato', 'Contato', Mail)}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'geral' && (
                    <PropertyForm property={propertyData} onSave={handleSaveProperty} />
                )}

                {activeTab === 'fotos' && (
                    <PhotosForm propertyId={propertyId} />
                )}

                {activeTab === 'comodidades' && (
                    <AmenitiesForm propertyId={propertyId} />
                )}

                {activeTab === 'regras' && (
                    <RulesForm propertyId={propertyId} />
                )}

                {activeTab === 'importar' && (
                    <ImportForm />
                )}

                {/* Integrations (iCal sync) */}
                {activeTab === 'integracoes' && (
                    <div className="space-y-6">
                        <IntegrationsForm propertyId={propertyId} />

                        <Card className="shadow-sm border-olive-900/10">
                            <CardHeader>
                                <CardTitle>Calendário iCal — Exportação</CardTitle>
                                <CardDescription>Copie a URL abaixo e adicione no Airbnb, Booking ou outro canal para sincronizar reservas da Casa Oliveira para fora.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-olive-900/5 rounded-xl font-mono text-sm break-all border border-olive-900/10 select-all">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/api/ical/export/${propertyData.slug}.ics` : ''}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/api/ical/export/${propertyData.slug}.ics`);
                                            toast.success('URL copiada!');
                                        }}
                                        className="bg-olive-900 hover:bg-olive-800 text-white"
                                    >
                                        Copiar URL
                                    </Button>
                                    <a href={`/api/ical/export/${propertyData.slug}.ics`} target="_blank">
                                        <Button variant="outline">Testar Feed</Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'financeiro' && (
                    <CancellationPolicyForm
                        propertyId={propertyId}
                        initialPolicy={propertyData?.cancellationPolicy}
                    />
                )}

                {/* System Settings */}
                {activeTab === 'contato' && (
                    <Card className="shadow-sm border-olive-900/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Canais de Atendimento</CardTitle>
                                <CardDescription>Configurações globais de contato para o sistema.</CardDescription>
                            </div>
                            <Button onClick={handleSaveSystem} disabled={isSavingSystem} className="bg-olive-900 border hover:bg-olive-800 text-white gap-2">
                                {isSavingSystem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <Input placeholder="(11) 99999-9999" value={systemSettings.whatsappNumber || ""}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, whatsappNumber: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>E-mail Oficial</Label>
                                    <Input type="email" placeholder="contato@empresa.com" value={systemSettings.contactEmail || ""}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, contactEmail: e.target.value })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
