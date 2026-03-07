"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DownloadCloud, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export function ImportForm() {
    const [airbnbUrl, setAirbnbUrl] = useState("");
    const [importing, setImporting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [summary, setSummary] = useState<any>(null);

    const handleImport = async () => {
        if (!airbnbUrl.includes("airbnb")) {
            toast.error("Por favor, insira um link válido do Airbnb.");
            return;
        }

        setImporting(true);
        try {
            const response = await axios.post('/api/admin/import-airbnb', { url: airbnbUrl });
            setSuccess(true);
            setSummary(response.data.summary);
            toast.success("Dados importados com sucesso! A página será recarregada...");

            setTimeout(() => {
                window.location.reload();
            }, 5000); // 5 sec to let user read the stats
        } catch (error: any) {
            const msg = error.response?.data?.error || "Erro ao conectar com o servidor para importar.";
            toast.error(msg);
        } finally {
            setImporting(false);
        }
    };

    return (
        <Card className="shadow-sm border-olive-900/10">
            <CardHeader>
                <CardTitle>Assistente de Importação</CardTitle>
                <CardDescription>
                    Puxe os dados básicos do seu anúncio existente no Airbnb para acelerar a configuração.
                    <br />
                    <em>Nota: A importação automática é parcial. Você precisará conferir os dados e ajustar as fotos manualmente.</em>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {success ? (
                    <div className="bg-green-50 border border-green-200 text-green-900 p-6 rounded-2xl flex flex-col items-center justify-center space-y-4">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                        <h3 className="text-xl font-bold">Importação Concluída</h3>
                        <div className="text-sm w-full max-w-sm bg-white p-4 rounded-xl shadow-sm border space-y-2">
                            <p><strong>Título Lido:</strong> {summary?.publicTitle}</p>
                            <p><strong>Fotos extraídas:</strong> {summary?.photos}</p>
                            <p><strong>Comodidades válidas:</strong> {summary?.amenities}</p>
                            <p><strong>Regras capturadas:</strong> {summary?.rules}</p>
                        </div>
                        <p className="text-center text-sm opacity-80 max-w-md">
                            Os dados indesejados e irrelevantes de interface foram filtrados da extração com sucesso!
                        </p>
                        <Button variant="outline" onClick={() => { setSuccess(false); setSummary(null); }} className="mt-4">
                            Importar outro link
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Link do Anúncio do Airbnb</Label>
                            <Input
                                placeholder="https://www.airbnb.com.br/rooms/12345678"
                                value={airbnbUrl}
                                onChange={(e) => {
                                    let val = e.target.value.trim();
                                    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
                                        if (val.startsWith("airbnb.") || val.startsWith("www.airbnb.")) {
                                            val = `https://${val}`;
                                        }
                                    }
                                    setAirbnbUrl(val);
                                }}
                                disabled={importing}
                            />
                        </div>
                        <div className="bg-olive-900/5 rounded-xl p-4 text-sm text-olive-900/80">
                            <strong>O que será copiado:</strong>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Título Público</li>
                                <li>Capacidade Base (Hóspedes, Quartos, Camas e Banheiros)</li>
                                <li>Descrição Curta</li>
                            </ul>
                        </div>
                    </div>
                )}

            </CardContent>
            {!success && (
                <CardFooter className="bg-gray-50 border-t rounded-b-xl flex justify-end p-4">
                    <Button
                        onClick={handleImport}
                        disabled={importing || !airbnbUrl}
                        className="bg-olive-900 hover:bg-olive-800 text-white gap-2"
                    >
                        {importing ? "Analisando..." : "Iniciar Importação"}
                        {!importing && <DownloadCloud className="w-4 h-4" />}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
