"use client";

import { useState, useEffect } from "react";
import {
    X, ShieldCheck, Phone, Mail, User, StickyNote,
    Star, Globe, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import axios from "axios";

const STATUS_OPTIONS = [
    { value: "REGULAR", label: "Regular" },
    { value: "VIP", label: "VIP" },
    { value: "FIVE_STAR", label: "5 Estrelas" },
    { value: "INACTIVE", label: "Inativo" },
    { value: "BLOCKED", label: "Bloqueado" },
];

const CHANNEL_OPTIONS = [
    { value: "DIRECT", label: "Reserva Direta" },
    { value: "AIRBNB", label: "Airbnb" },
    { value: "BOOKING", label: "Booking.com" },
    { value: "WHATSAPP", label: "WhatsApp" },
    { value: "MANUAL", label: "Cadastro Manual" },
];

interface GuestFormData {
    name: string;
    email: string;
    phone: string;
    isVip: boolean;
    isFiveStar: boolean;
    status: string;
    sourceChannel: string;
    notes: string;
}

interface Guest extends GuestFormData {
    id?: string;
}

interface GuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    guest?: Guest | null;
}

const emptyForm: GuestFormData = {
    name: "",
    email: "",
    phone: "",
    isVip: false,
    isFiveStar: false,
    status: "REGULAR",
    sourceChannel: "MANUAL",
    notes: "",
};

export function GuestModal({ isOpen, onClose, onSuccess, guest }: GuestModalProps) {
    const [formData, setFormData] = useState<GuestFormData>(emptyForm);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (guest) {
            setFormData({
                name: guest.name || "",
                email: guest.email || "",
                phone: guest.phone || "",
                isVip: guest.isVip || false,
                isFiveStar: guest.isFiveStar || false,
                status: guest.status || "REGULAR",
                sourceChannel: guest.sourceChannel || "MANUAL",
                notes: guest.notes || "",
            });
        } else {
            setFormData(emptyForm);
        }
    }, [guest, isOpen]);

    if (!isOpen) return null;

    const set = (field: keyof GuestFormData, value: any) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (guest?.id) {
                await axios.patch(`/api/admin/guests/${guest.id}`, formData);
                toast.success("Hóspede atualizado com sucesso!");
            } else {
                await axios.post("/api/admin/guests", formData);
                toast.success("Hóspede criado com sucesso!");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao salvar hóspede");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-olive-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-olive-900/5 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-olive-900/5 flex justify-between items-center bg-sand-50/30 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-olive-900">
                            {guest?.id ? "Editar Hóspede" : "Novo Hóspede"}
                        </h2>
                        <p className="text-olive-900/60 text-sm font-medium">Preencha os dados do CRM da Casa Oliveira.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-olive-900/5 rounded-full transition-colors text-olive-900/40 hover:text-olive-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-olive-900/70">
                            <User className="w-4 h-4" /> Nome Completo
                        </Label>
                        <Input
                            required
                            value={formData.name}
                            onChange={e => set("name", e.target.value)}
                            placeholder="Ex: Roberto Almeida"
                            className="rounded-xl h-12 border-olive-900/10 focus:border-olive-900/30"
                        />
                    </div>

                    {/* Email + Telefone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-olive-900/70">
                                <Mail className="w-4 h-4" /> E-mail
                            </Label>
                            <Input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => set("email", e.target.value)}
                                placeholder="roberto@exemplo.com"
                                className="rounded-xl h-12 border-olive-900/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-olive-900/70">
                                <Phone className="w-4 h-4" /> WhatsApp
                            </Label>
                            <Input
                                value={formData.phone}
                                onChange={e => set("phone", e.target.value)}
                                placeholder="+55 11 9...."
                                className="rounded-xl h-12 border-olive-900/10"
                            />
                        </div>
                    </div>

                    {/* Status + Canal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-olive-900/70">
                                <Crown className="w-4 h-4" /> Status
                            </Label>
                            <select
                                value={formData.status}
                                onChange={e => set("status", e.target.value)}
                                className="w-full h-12 rounded-xl border border-olive-900/10 px-3 text-sm text-olive-900 bg-white focus:outline-none focus:border-olive-900/30"
                            >
                                {STATUS_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-olive-900/70">
                                <Globe className="w-4 h-4" /> Canal de Origem
                            </Label>
                            <select
                                value={formData.sourceChannel}
                                onChange={e => set("sourceChannel", e.target.value)}
                                className="w-full h-12 rounded-xl border border-olive-900/10 px-3 text-sm text-olive-900 bg-white focus:outline-none focus:border-olive-900/30"
                            >
                                {CHANNEL_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-olive-900/70">
                            <StickyNote className="w-4 h-4" /> Notas Internas
                        </Label>
                        <textarea
                            value={formData.notes}
                            onChange={e => set("notes", e.target.value)}
                            className="w-full min-h-[90px] rounded-2xl border border-olive-900/10 p-4 text-sm focus:outline-none focus:border-olive-900/30 bg-white"
                            placeholder="Preferências, observações de estadias anteriores..."
                        />
                    </div>

                    {/* Badges VIP + 5 Estrelas */}
                    <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${formData.isVip ? 'bg-yellow-50 border-yellow-300' : 'bg-olive-900/5 border-olive-900/5'}`}>
                            <input
                                type="checkbox"
                                checked={formData.isVip}
                                onChange={e => set("isVip", e.target.checked)}
                                className="w-5 h-5 accent-yellow-600 rounded cursor-pointer"
                            />
                            <span className="flex items-center gap-1.5 font-bold text-sm text-olive-900">
                                <Crown className="w-4 h-4 text-yellow-500" /> VIP
                            </span>
                        </label>
                        <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${formData.isFiveStar ? 'bg-amber-50 border-amber-300' : 'bg-olive-900/5 border-olive-900/5'}`}>
                            <input
                                type="checkbox"
                                checked={formData.isFiveStar}
                                onChange={e => set("isFiveStar", e.target.checked)}
                                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                            />
                            <span className="flex items-center gap-1.5 font-bold text-sm text-olive-900">
                                <Star className="w-4 h-4 text-amber-400" /> 5 Estrelas
                            </span>
                        </label>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-4 pt-4 border-t border-olive-900/5">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl font-bold border border-olive-900/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-xl font-bold bg-olive-900 hover:bg-olive-800 text-sand-50"
                        >
                            {isLoading ? "Salvando..." : guest?.id ? "Salvar Alterações" : "Criar Hóspede"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
