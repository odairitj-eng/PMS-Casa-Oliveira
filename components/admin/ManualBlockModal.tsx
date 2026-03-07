"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Lock, AlertCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface ManualBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    propertyId: string;
}

const BLOCK_REASONS = [
    { id: "manutencao", label: "Manutenção", value: "Manutenção técnica" },
    { id: "uso_proprio", label: "Uso próprio", value: "Uso proprietário" },
    { id: "indisponivel", label: "Indisponível", value: "Indisponível (Admin)" },
    { id: "outros", label: "Outros", value: "Outros" },
];

const BG = "#F5EBE1";   // Bege padrão do sistema (sand-50)
const FG = "#103020";

export function ManualBlockModal({ isOpen, onClose, onSuccess, propertyId }: ManualBlockModalProps) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleBlock = async () => {
        if (!startDate || !endDate) { toast.error("Selecione as datas de início e fim."); return; }
        const finalReason = reason === "Outros" ? customReason : reason;
        if (!finalReason) { toast.error("Selecione ou informe um motivo."); return; }

        setIsSubmitting(true);
        const tId = toast.loading("Registrando bloqueio...");
        try {
            await axios.post("/api/admin/calendar/update", {
                propertyId: "casa-oliveira-id", startDate, endDate, isAvailable: false, reason: finalReason
            });
            toast.success("Datas bloqueadas!", { id: tId });
            onSuccess(); onClose();
            setStartDate(""); setEndDate(""); setReason(""); setCustomReason("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao bloquear.", { id: tId });
        } finally { setIsSubmitting(false); }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
        }}>
            <div style={{
                backgroundColor: BG,
                borderRadius: "24px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
                overflow: "hidden",
                position: "relative",
            }}>
                {/* Fechar */}
                <button onClick={onClose} style={{
                    position: "absolute", top: "16px", right: "16px",
                    backgroundColor: "rgba(16,48,32,0.12)",
                    border: "none", borderRadius: "50%",
                    width: "36px", height: "36px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                }}>
                    <X size={16} color={FG} />
                </button>

                {/* Body */}
                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Header */}
                    <div>
                        <div style={{
                            width: 44, height: 44, borderRadius: "12px",
                            backgroundColor: "rgba(16,48,32,0.12)",
                            border: "1.5px solid rgba(16,48,32,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "12px",
                        }}>
                            <Lock size={20} color={FG} />
                        </div>
                        <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 800, color: FG }}>
                            Bloquear Período Manualmente
                        </h2>
                        <p style={{
                            margin: 0, fontSize: "13px", fontWeight: 600, color: FG,
                            backgroundColor: "rgba(255,255,255,0.4)",
                            padding: "10px 14px", borderRadius: "12px",
                            border: "1px solid rgba(16,48,32,0.1)",
                        }}>
                            Selecione o intervalo de datas para retirar do mercado. Afeta o site e todos os canais via iCal.
                        </p>
                    </div>

                    {/* Datas */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        {[
                            { label: "Data Início", value: startDate, set: setStartDate },
                            { label: "Data Fim", value: endDate, set: setEndDate },
                        ].map(({ label, value, set }) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{
                                    fontSize: "11px", fontWeight: 800, color: FG,
                                    textTransform: "uppercase", letterSpacing: "0.1em",
                                    display: "flex", alignItems: "center", gap: "4px",
                                }}>
                                    <Calendar size={12} /> {label}
                                </label>
                                <input type="date" value={value} onChange={e => set(e.target.value)} style={{
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                    border: "1.5px solid rgba(16,48,32,0.2)",
                                    borderRadius: "10px", height: "48px",
                                    padding: "0 12px", fontSize: "14px",
                                    fontWeight: 700, color: FG,
                                    width: "100%", boxSizing: "border-box", outline: "none",
                                }} />
                            </div>
                        ))}
                    </div>

                    {/* Motivo */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label style={{
                            fontSize: "11px", fontWeight: 800, color: FG,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>Motivo do Bloqueio</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            {BLOCK_REASONS.map((r) => (
                                <button key={r.id} onClick={() => setReason(r.value)} style={{
                                    height: "44px", borderRadius: "10px",
                                    fontSize: "12px", fontWeight: 800,
                                    padding: "0 12px", textAlign: "left",
                                    cursor: "pointer",
                                    border: reason === r.value ? "none" : "1.5px solid rgba(16,48,32,0.15)",
                                    backgroundColor: reason === r.value ? FG : "rgba(255,255,255,0.8)",
                                    color: reason === r.value ? "#fff" : FG,
                                    boxShadow: reason === r.value ? `0 4px 14px rgba(16,48,32,0.35)` : "none",
                                }}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        {reason === "Outros" && (
                            <input placeholder="Motivo personalizado..." value={customReason}
                                onChange={e => setCustomReason(e.target.value)} style={{
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                    border: "1.5px solid rgba(16,48,32,0.2)",
                                    borderRadius: "10px", height: "44px",
                                    padding: "0 12px", fontSize: "14px",
                                    fontWeight: 700, color: FG,
                                    width: "100%", boxSizing: "border-box", outline: "none",
                                }}
                            />
                        )}
                    </div>

                    {/* Aviso */}
                    <div style={{
                        backgroundColor: "rgba(255,255,255,0.45)",
                        border: "1px solid rgba(16,48,32,0.12)",
                        borderRadius: "14px", padding: "14px",
                        display: "flex", gap: "10px", alignItems: "flex-start",
                    }}>
                        <AlertCircle size={16} color={FG} style={{ marginTop: 1, flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: FG, lineHeight: 1.5 }}>
                            Reservas confirmadas existentes no período impedirão o bloqueio automático.
                        </p>
                    </div>

                    {/* Botões */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <button onClick={handleBlock} disabled={isSubmitting} style={{
                            height: "60px",
                            backgroundColor: FG,
                            color: "#fff",
                            fontWeight: 900, fontSize: "16px",
                            border: "none", borderRadius: "30px",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            boxShadow: `0 8px 30px rgba(16,48,32,0.4)`,
                            opacity: isSubmitting ? 0.7 : 1,
                        }}>
                            {isSubmitting ? "Bloqueando..." : "Confirmar Bloqueio Manual"}
                        </button>
                        <button onClick={onClose} style={{
                            height: "40px", backgroundColor: "transparent",
                            color: FG, fontWeight: 800, fontSize: "12px",
                            border: "none", borderRadius: "10px",
                            cursor: "pointer", letterSpacing: "0.08em",
                        }}>CANCELAR</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
