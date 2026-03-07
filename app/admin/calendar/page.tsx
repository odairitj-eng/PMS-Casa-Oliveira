"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ManualBlockModal } from "@/components/admin/ManualBlockModal";
import toast from "react-hot-toast";
import axios from "axios";
import { RefreshCcw, Lock, CalendarPlus, X, Building, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { useSearchParams, useRouter } from 'next/navigation';

const SAND = "#F5EBE1";

function CalendarContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [refreshKey, setRefreshKey] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showOpenWindow, setShowOpenWindow] = useState(false);

    // Estado para Abrir Janela
    const [windowStart, setWindowStart] = useState(format(new Date(), "yyyy-MM-dd"));
    const [windowDays, setWindowDays] = useState("90");
    const [windowPrice, setWindowPrice] = useState("");
    const [isOpeningWindow, setIsOpeningWindow] = useState(false);
    const [basePrice, setBasePrice] = useState<number>(200);

    const [properties, setProperties] = useState<{ id: string, name: string }[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(searchParams.get('propertyId'));
    const [isPropertiesLoading, setIsPropertiesLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Carregar Propriedades
    useEffect(() => {
        axios.get("/api/admin/properties", { timeout: 8000 }).then(res => {
            const props = res.data;
            setProperties(props);

            // Se não tem propriedade selecionada na URL, escolhe a primeira
            if (!selectedPropertyId && props.length > 0) {
                setSelectedPropertyId(props[0].id);
                router.replace(`/admin/calendar?propertyId=${props[0].id}`);
            }
            setIsPropertiesLoading(false);
        }).catch((err) => {
            console.error("ERRO fetch properties:", err);
            toast.error("Erro de conexão ao carregar propriedades. Tente reiniciar a sessão.");
            setHasError(true);
            setIsPropertiesLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Buscar Preço Base ao carregar/trocar propriedade
    useEffect(() => {
        if (!selectedPropertyId) return;

        axios.get(`/api/calendar?propertyId=${selectedPropertyId}`).then(res => {
            if (res.data?.property?.basePrice) {
                setBasePrice(res.data.property.basePrice);
                setWindowPrice(String(res.data.property.basePrice));
            }
        });
    }, [selectedPropertyId]);

    const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setSelectedPropertyId(newId);
        router.push(`/admin/calendar?propertyId=${newId}`);
    };

    const handleForceSync = async () => {
        if (!selectedPropertyId) return;
        setIsSyncing(true);
        const tId = toast.loading("Sincronizando iCal...");
        try {
            await axios.post('/api/calendar/sync', { propertyId: selectedPropertyId });
            toast.success("Calendário sincronizado!", { id: tId });
            setRefreshKey(prev => prev + 1);
        } catch {
            toast.error("Erro ao sincronizar.", { id: tId });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleOpenWindow = async () => {
        if (!windowStart) { toast.error("Selecione a data de início."); return; }
        setIsOpeningWindow(true);
        const tId = toast.loading("Abrindo janela de disponibilidade...");
        try {
            // Garante que o cálculo do endDate seja feito corretamente no fuso local
            const start = new Date(windowStart + "T12:00:00");
            const end = addDays(start, parseInt(windowDays));

            await axios.post("/api/admin/availability-windows", {
                propertyId: selectedPropertyId,
                startDate: windowStart,
                mode: "MANUAL_RANGE",
                endDate: format(end, "yyyy-MM-dd"),
                price: windowPrice ? parseFloat(windowPrice) : null,
            });
            toast.success("Janela aberta e bloqueios manuais removidos!", { id: tId });
            setRefreshKey(prev => prev + 1);
            setShowOpenWindow(false);
        } catch (error: any) {
            const msg = error.response?.data?.error || "Erro ao abrir janela.";
            toast.error(msg, { id: tId });
        } finally {
            setIsOpeningWindow(false);
        }
    };

    return (
        <div className="space-y-4 px-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-[2.5rem] border border-olive-900/5 shadow-sm gap-6 md:gap-0">
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-olive-900 tracking-tight">Calendário de Tarifas</h1>

                    {/* Imóvel Selector Component */}
                    {isPropertiesLoading ? (
                        <div className="h-11 w-[240px] bg-sand-50/50 rounded-2xl animate-pulse flex items-center px-4 text-xs font-bold text-olive-900/40">Carregando imóveis...</div>
                    ) : hasError ? (
                        <div className="h-11 w-[240px] bg-red-50 rounded-2xl flex items-center px-4 text-xs font-bold text-red-600 border border-red-200">Falha ao carregar API</div>
                    ) : properties.length > 0 ? (
                        <div className="relative inline-flex items-center">
                            <div className="absolute left-4 pointer-events-none text-olive-900/40">
                                <Building className="w-4 h-4" />
                            </div>
                            <select
                                value={selectedPropertyId || ""}
                                onChange={handlePropertyChange}
                                className="appearance-none bg-sand-50/50 hover:bg-sand-50 transition-colors border border-olive-900/10 text-olive-900 text-sm font-bold rounded-2xl h-11 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-olive-900/20 cursor-pointer w-full md:w-auto min-w-[240px]"
                            >
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 pointer-events-none text-olive-900/40">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    ) : (
                        <div className="h-11 w-[240px] bg-sand-50/50 rounded-2xl flex items-center px-4 text-xs font-bold text-olive-900/40 border border-olive-900/10">Nenhum imóvel disponível</div>
                    )}
                </div>

                <div className="flex items-center gap-3 mt-6 md:mt-0">
                    {/* Sincronizar iCal */}
                    <button
                        onClick={handleForceSync}
                        disabled={isSyncing}
                        className={cn(
                            "flex items-center gap-2 px-5 h-11 rounded-2xl text-[13px] font-extrabold transition-all border",
                            isSyncing
                                ? "bg-black/5 text-black/20 border-transparent cursor-not-allowed"
                                : "border-olive-900/10 text-olive-900 hover:bg-olive-900/5 hover:border-olive-900/30"
                        )}
                    >
                        <RefreshCcw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                        {isSyncing ? "Sincronizando..." : "Sincronizar iCal"}
                    </button>

                    {/* Abrir Janela de Reservas */}
                    <button
                        onClick={() => setShowOpenWindow(true)}
                        className="flex items-center gap-2 px-5 h-11 border border-olive-900/20 rounded-2xl text-[13px] font-extrabold transition-all text-olive-900 hover:bg-olive-900/5"
                    >
                        <CalendarPlus className="w-4 h-4" />
                        Abrir Janela
                    </button>

                    {/* Bloquear Manual */}
                    <button
                        onClick={() => setShowBlockModal(true)}
                        className="flex items-center gap-2 px-6 h-11 bg-olive-900 text-white hover:bg-black rounded-2xl text-[13px] font-extrabold transition-all shadow-lg shadow-olive-900/10 active:scale-95"
                    >
                        <Lock className="w-4 h-4" />
                        Bloquear Manual
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] p-2 border border-olive-900/5 shadow-inner min-h-[800px]">
                {selectedPropertyId ? (
                    <CalendarView refreshKey={refreshKey} propertyId={selectedPropertyId} />
                ) : (
                    <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-olive-900/40">
                        {isPropertiesLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-900"></div>
                                <p className="font-medium text-sm animate-pulse">Aguardando imóveis...</p>
                            </>
                        ) : hasError ? (
                            <p className="font-medium text-red-600">Erro de conexão ao buscar imóveis.</p>
                        ) : (
                            <p className="font-medium">Nenhum imóvel selecionado ou cadastrado.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Bloquear Manual */}
            {selectedPropertyId && (
                <ManualBlockModal
                    isOpen={showBlockModal}
                    onClose={() => setShowBlockModal(false)}
                    onSuccess={() => setRefreshKey(prev => prev + 1)}
                    propertyId={selectedPropertyId}
                />
            )}

            {/* Modal inline: Abrir Janela de Reservas */}
            {showOpenWindow && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 99999,
                    backgroundColor: "rgba(0,0,0,0.75)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "16px",
                }}>
                    <div style={{
                        backgroundColor: SAND,
                        borderRadius: "24px",
                        width: "100%",
                        maxWidth: "440px",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
                        overflow: "hidden",
                        position: "relative",
                    }}>
                        {/* Fechar */}
                        <button onClick={() => setShowOpenWindow(false)} style={{
                            position: "absolute", top: "16px", right: "16px",
                            backgroundColor: "rgba(16,48,32,0.1)", border: "none",
                            borderRadius: "50%", width: "36px", height: "36px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                        }}>
                            <X size={16} color="#103020" />
                        </button>

                        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Ícone + Título */}
                            <div>
                                <div style={{
                                    width: 44, height: 44, borderRadius: "12px",
                                    backgroundColor: "rgba(16,48,32,0.1)",
                                    border: "1.5px solid rgba(16,48,32,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginBottom: "12px",
                                }}>
                                    <CalendarPlus size={20} color="#103020" />
                                </div>
                                <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800, color: "#103020" }}>
                                    Abrir Janela de Reservas
                                </h2>
                                <p style={{ margin: 0, fontSize: "13px", color: "#103020", fontWeight: 600, opacity: 0.7 }}>
                                    Defina a partir de qual data e por quantos dias o calendário ficará aberto para reservas.
                                </p>
                            </div>

                            {/* Data início */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 800, color: "#103020", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Data de Início
                                </label>
                                <input
                                    type="date"
                                    value={windowStart}
                                    onChange={e => setWindowStart(e.target.value)}
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.9)",
                                        border: "1.5px solid rgba(16,48,32,0.2)",
                                        borderRadius: "10px", height: "48px",
                                        padding: "0 12px", fontSize: "14px",
                                        fontWeight: 700, color: "#103020",
                                        width: "100%", boxSizing: "border-box", outline: "none",
                                    }}
                                />
                            </div>

                            {/* Quantos dias */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 800, color: "#103020", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Abrir por quantos dias
                                </label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                                    {["30", "60", "90", "180"].map(d => (
                                        <button key={d} onClick={() => setWindowDays(d)} style={{
                                            padding: "10px 0",
                                            borderRadius: "10px",
                                            fontSize: "13px",
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            border: windowDays === d ? "none" : "1.5px solid rgba(16,48,32,0.15)",
                                            backgroundColor: windowDays === d ? "#103020" : "rgba(255,255,255,0.8)",
                                            color: windowDays === d ? "#fff" : "#103020",
                                            boxShadow: windowDays === d ? "0 4px 12px rgba(16,48,32,0.3)" : "none",
                                        }}>
                                            {d}d
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qual o preço */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 800, color: "#103020", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Preço por noite (R$)
                                </label>
                                <input
                                    type="number"
                                    value={windowPrice}
                                    onChange={e => setWindowPrice(e.target.value)}
                                    placeholder={String(basePrice)}
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.9)",
                                        border: "1.5px solid rgba(16,48,32,0.2)",
                                        borderRadius: "10px", height: "48px",
                                        padding: "0 12px", fontSize: "16px",
                                        fontWeight: 800, color: "#103020",
                                        width: "100%", boxSizing: "border-box", outline: "none",
                                    }}
                                />
                                <p style={{ fontSize: "10px", color: "rgba(16,48,32,0.5)", fontWeight: 600 }}>
                                    Isso aplicará este preço em todos os dias deste intervalo como um ajuste manual.
                                </p>
                            </div>

                            {/* Botões */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
                                <button onClick={handleOpenWindow} disabled={isOpeningWindow} style={{
                                    height: "56px",
                                    backgroundColor: "#103020",
                                    color: "#fff",
                                    fontWeight: 900, fontSize: "15px",
                                    border: "none", borderRadius: "28px",
                                    cursor: isOpeningWindow ? "not-allowed" : "pointer",
                                    boxShadow: "0 8px 24px rgba(16,48,32,0.35)",
                                    opacity: isOpeningWindow ? 0.7 : 1,
                                }}>
                                    {isOpeningWindow ? "Abrindo..." : "Confirmar Abertura"}
                                </button>
                                <button onClick={() => setShowOpenWindow(false)} style={{
                                    height: "36px", backgroundColor: "transparent",
                                    color: "#103020", fontWeight: 800, fontSize: "12px",
                                    border: "none", cursor: "pointer", letterSpacing: "0.08em",
                                }}>CANCELAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CalendarPage() {
    return (
        <Suspense fallback={<div className="p-8 flex items-center justify-center min-h-[500px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-900"></div></div>}>
            <CalendarContent />
        </Suspense>
    );
}
