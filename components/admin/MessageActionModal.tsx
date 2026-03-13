"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Phone,
    Mail,
    Loader2,
    Send,
    Eye,
    History
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface MessageActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    guestId: string;
    reservationId?: string;
    onSuccess?: () => void;
}

export function MessageActionModal({
    isOpen,
    onClose,
    guestId,
    reservationId,
    onSuccess
}: MessageActionModalProps) {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            setPreview(null);
            setSelectedTemplateId("");
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get("/api/admin/messages/templates");
            setTemplates(res.data.filter((t: any) => t.isActive));
        } catch (error) {
            toast.error("Erro ao carregar templates");
        }
    };

    const handlePreview = async (templateId: string) => {
        setSelectedTemplateId(templateId);
        setIsPreviewLoading(true);
        try {
            const res = await axios.post("/api/admin/messages/send", {
                templateId,
                guestId,
                reservationId,
                previewOnly: true // Opcional: poderíamos ter um flag para não registrar log no preview
            });
            setPreview(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao gerar preview");
            setPreview(null);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleSend = async () => {
        if (!selectedTemplateId) return;

        setIsLoading(true);
        try {
            const res = await axios.post("/api/admin/messages/send", {
                templateId: selectedTemplateId,
                guestId,
                reservationId
            });

            if (res.data.whatsappUrl) {
                window.open(res.data.whatsappUrl, "_blank");
                toast.success("Link do WhatsApp gerado!");
            } else if (res.data.channelType === "EMAIL") {
                toast.success("E-mail enviado com sucesso!");
            }

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao disparar mensagem");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] bg-white border-0 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-olive-900 text-sand-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold">Enviar Mensagem</DialogTitle>
                            <DialogDescription className="text-white/60 font-medium">
                                Selecione um template para disparar ao hóspede
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-olive-900/40 ml-1">Modelo de Mensagem</label>
                        <Select value={selectedTemplateId} onValueChange={handlePreview}>
                            <SelectTrigger className="rounded-xl border-olive-900/10 h-14 bg-sand-50/50">
                                <SelectValue placeholder="Selecione um template registrado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-olive-900/10">
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="py-3">
                                        <div className="flex items-center gap-3">
                                            {t.channelType === 'EMAIL' ? <Mail className="w-4 h-4 text-blue-500" /> : <Phone className="w-4 h-4 text-green-500" />}
                                            <div className="text-left">
                                                <div className="font-bold text-olive-900 leading-tight">{t.name}</div>
                                                <div className="text-[10px] text-olive-900/40 uppercase">{t.category}</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-h-[200px] rounded-3xl border-2 border-dashed border-olive-900/5 bg-sand-50/30 p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-olive-900/40">
                                <Eye className="w-3 h-3" /> Pré-visualização Real
                            </div>
                            {preview && (
                                <Badge variant="outline" className="text-[9px] border-olive-900/10 font-bold uppercase text-olive-900/40">
                                    {preview.channelType}
                                </Badge>
                            )}
                        </div>

                        {isPreviewLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-olive-900/20" />
                            </div>
                        ) : preview ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                {preview.renderedSubject && (
                                    <div className="pb-3 border-b border-olive-900/5">
                                        <p className="text-[10px] font-bold text-olive-900/30 uppercase mb-1">Assunto</p>
                                        <p className="font-bold text-olive-900">{preview.renderedSubject}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-bold text-olive-900/30 uppercase mb-1">Corpo</p>
                                    <p className="text-sm text-olive-900/70 font-medium leading-relaxed whitespace-pre-wrap">
                                        {preview.renderedBody}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <MessageSquare className="w-8 h-8 text-olive-900/10" />
                                <p className="text-xs text-olive-900/30 font-bold uppercase text-center max-w-[200px]">
                                    Selecione um template para ver como ele ficará
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-8 pt-0 flex flex-col md:flex-row gap-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl h-12 text-olive-900/40 font-bold flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={!preview || isLoading}
                        onClick={handleSend}
                        className={`
              rounded-2xl h-14 px-8 font-black flex-[2] flex gap-3 shadow-lg transition-all
              ${preview?.channelType === 'EMAIL' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
              text-white
            `}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                {preview?.channelType === 'WHATSAPP' ? 'Abrir WhatsApp' : 'Enviar E-mail Agora'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
