"use client";

import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { X, Lock, Minus, Plus, Settings, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

// ────────────────────────────────────────────────────────────
// Paleta
// ────────────────────────────────────────────────────────────
const BG = "#F5EBE1";   // Bege padrão do sistema (sand-50)
const FG = "#103020";

interface CalendarSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRange: { start: Date; end: Date } | null;
    onSuccess: () => void;
    basePrice?: number;
    propertyId: string;
}

const BLOCK_REASONS = [
    { id: "manutencao", label: "Manutenção", value: "Manutenção técnica" },
    { id: "uso_proprio", label: "Uso próprio", value: "Uso proprietário" },
    { id: "indisponivel", label: "Indisponível", value: "Indisponível (Admin)" },
    { id: "outros", label: "Outros", value: "Outros" },
];

export function CalendarSidebar({ isOpen, onClose, selectedRange, onSuccess, basePrice, propertyId }: CalendarSidebarProps) {
    const [price, setPrice] = useState("");
    const [minNights, setMinNights] = useState("2");
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Evita o scroll do body quando está aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [isOpen]);

    if (!isOpen || !selectedRange) return null;

    const handleSave = async () => {
        if (isAvailable === false) {
            const finalReason = reason === "Outros" ? customReason : reason;
            if (!finalReason) {
                toast.error("Para bloquear, selecione ou informe um motivo.");
                return;
            }
        }

        if (!price && minNights === "2" && isAvailable === null) {
            toast.error("Altere pelo menos um campo para salvar.");
            return;
        }

        setIsSubmitting(true);
        const tId = toast.loading("Salvando configurações...");
        try {
            const finalReason = reason === "Outros" ? customReason : reason;
            await axios.post("/api/admin/calendar/update", {
                startDate: selectedRange.start,
                endDate: selectedRange.end,
                price: price.trim() || undefined,
                minNights: minNights.trim() || undefined,
                isAvailable: isAvailable !== null ? isAvailable : undefined,
                reason: isAvailable === false ? finalReason : undefined,
                propertyId,
            });
            toast.success("Configurações salvas!", { id: tId });
            onSuccess();
            onClose();
            // Resetar estados
            setPrice("");
            setMinNights("2");
            setIsAvailable(null);
            setReason("");
            setCustomReason("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao salvar.", { id: tId });
        } finally {
            setIsSubmitting(false);
        }
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
                maxHeight: "90vh",
                boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
                overflowY: "auto",
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
                    zIndex: 10,
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
                            <Settings size={20} color={FG} />
                        </div>
                        <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 800, color: FG }}>
                            Configurar Período
                        </h2>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: "rgba(255,255,255,0.4)",
                            color: FG,
                            borderRadius: "12px",
                            padding: "8px 14px",
                            fontWeight: 700,
                            fontSize: "13px",
                            border: "1px solid rgba(16,48,32,0.1)",
                        }}>
                            <Calendar size={14} style={{ marginRight: 6 }} />
                            {format(selectedRange.start, "d 'de' MMM", { locale: ptBR })}
                            {isSameDay(selectedRange.start, selectedRange.end)
                                ? ""
                                : ` — ${format(selectedRange.end, "d 'de' MMM", { locale: ptBR })}`}
                        </div>
                    </div>

                    {/* Tarifa e Estadia */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label style={{
                            fontSize: "11px", fontWeight: 800, color: FG,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>TARIFA E ESTADIA</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>

                            {/* Preço por noite */}
                            <div style={{
                                backgroundColor: "rgba(255,255,255,0.6)",
                                border: "1.5px solid rgba(16,48,32,0.15)",
                                borderRadius: "14px",
                                padding: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}>
                                <div>
                                    <div style={{ fontSize: "12px", fontWeight: 800, color: FG, opacity: 0.9, marginBottom: "4px" }}>Preço por noite</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{ fontSize: "14px", color: FG, fontWeight: 700, opacity: 0.8 }}>R$</span>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            placeholder={basePrice ? String(basePrice) : "180"}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                outline: "none",
                                                fontSize: "26px",
                                                fontWeight: 800,
                                                color: FG,
                                                width: "120px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: "rgba(16,48,32,0.08)",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: FG,
                                }}>
                                    / noite
                                </div>
                            </div>

                            {/* Mínimo de noites */}
                            <div style={{
                                backgroundColor: "rgba(255,255,255,0.6)",
                                border: "1.5px solid rgba(16,48,32,0.15)",
                                borderRadius: "14px",
                                padding: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "12px", fontWeight: 800, color: FG, opacity: 0.9, marginBottom: "2px" }}>Mínimo de noites</div>
                                    <div style={{ fontSize: "12px", color: FG, opacity: 0.7, fontWeight: 600 }}>Estadia mínima obrigatória</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button
                                        onClick={() => setMinNights(p => String(Math.max(1, (parseInt(p) || 1) - 1)))}
                                        style={{
                                            backgroundColor: "rgba(16,48,32,0.08)", border: "none", cursor: "pointer",
                                            borderRadius: "50%", width: "36px", height: "36px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: FG,
                                        }}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontSize: "18px", fontWeight: 800, color: FG, minWidth: "24px", textAlign: "center" }}>
                                        {minNights || "2"}
                                    </span>
                                    <button
                                        onClick={() => setMinNights(p => String((parseInt(p) || 2) + 1))}
                                        style={{
                                            backgroundColor: "rgba(16,48,32,0.08)", border: "none", cursor: "pointer",
                                            borderRadius: "50%", width: "36px", height: "36px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: FG,
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disponibilidade Manual */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label style={{
                            fontSize: "11px", fontWeight: 800, color: FG,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>DISPONIBILIDADE MANUAL</label>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <button
                                onClick={() => setIsAvailable(true)}
                                style={{
                                    height: "46px", borderRadius: "10px",
                                    fontSize: "13px", fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    border: isAvailable === true ? "none" : "1.5px solid rgba(16,48,32,0.15)",
                                    backgroundColor: isAvailable === true ? FG : "rgba(255,255,255,0.8)",
                                    color: isAvailable === true ? "#fff" : FG,
                                    boxShadow: isAvailable === true ? `0 4px 14px rgba(16,48,32,0.35)` : "none",
                                }}
                            >
                                ✅ Disponível
                            </button>
                            <button
                                onClick={() => setIsAvailable(false)}
                                style={{
                                    height: "46px", borderRadius: "10px",
                                    fontSize: "13px", fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                    border: isAvailable === false ? "none" : "1.5px solid rgba(16,48,32,0.15)",
                                    backgroundColor: isAvailable === false ? "#B94B4B" : "rgba(255,255,255,0.8)",
                                    color: isAvailable === false ? "#fff" : FG,
                                    boxShadow: isAvailable === false ? `0 4px 14px rgba(185,75,75,0.35)` : "none",
                                }}
                            >
                                🚫 Bloquear
                            </button>
                        </div>

                        {/* Motivo do Bloqueio (se selecionado Bloquear) */}
                        {isAvailable === false && (
                            <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <label style={{
                                    fontSize: "11px", fontWeight: 800, color: FG,
                                    textTransform: "uppercase", letterSpacing: "0.1em",
                                }}>Motivo do Bloqueio</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                    {BLOCK_REASONS.map((r) => (
                                        <button key={r.id} onClick={() => setReason(r.value)} style={{
                                            height: "42px", borderRadius: "10px",
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
                                            borderRadius: "10px", height: "46px",
                                            padding: "0 14px", fontSize: "14px",
                                            fontWeight: 700, color: FG,
                                            width: "100%", boxSizing: "border-box", outline: "none",
                                            marginTop: "4px"
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botões Acão */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                        <button onClick={handleSave} disabled={isSubmitting} style={{
                            height: "60px",
                            backgroundColor: FG,
                            color: "#fff",
                            fontWeight: 900, fontSize: "16px",
                            border: "none", borderRadius: "30px",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            boxShadow: `0 8px 30px rgba(16,48,32,0.4)`,
                            opacity: isSubmitting ? 0.7 : 1,
                        }}>
                            {isSubmitting ? "Salvando..." : "Confirmar Configurações"}
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

