"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationId: string;
    onSuccess: () => void;
}

export function CancellationModal({ isOpen, onClose, reservationId, onSuccess }: CancellationModalProps) {
    const [isLoadingPreview, setIsLoadingPreview] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && reservationId) {
            fetchPreview();
        }
    }, [isOpen, reservationId]);

    const fetchPreview = async () => {
        setIsLoadingPreview(true);
        setError(null);
        try {
            const res = await axios.get(`/api/reservations/${reservationId}/cancel`);
            setPreviewData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "Erro ao carregar prévia de cancelamento.");
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleConfirm = async () => {
        setIsCancelling(true);
        try {
            await axios.post(`/api/reservations/${reservationId}/cancel`);
            toast.success("Reserva cancelada com sucesso.");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Erro ao cancelar reserva.");
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-[2rem] border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-olive-900 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                        Cancelar Reserva
                    </DialogTitle>
                    <DialogDescription>
                        Revise os detalhes do cancelamento e reembolso abaixo.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingPreview ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-olive-900" />
                        <p className="text-sm text-olive-900/40 font-bold uppercase tracking-widest">Calculando reembolso...</p>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center space-y-4">
                        <p className="text-red-500 font-medium">{error}</p>
                        <Button variant="outline" onClick={onClose} className="rounded-xl">Fechar</Button>
                    </div>
                ) : (
                    <div className="space-y-6 pt-4">
                        <div className="bg-olive-900/5 p-4 rounded-2xl space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-olive-900/60 font-medium">Valor Total Pago:</span>
                                <span className="text-olive-900 font-bold">R$ {previewData.totalPaid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-olive-900/60 font-medium">Política Aplicada:</span>
                                <span className="text-olive-900 font-bold bg-white px-2 py-0.5 rounded-lg border border-olive-900/10">
                                    {previewData.policyName}
                                </span>
                            </div>
                            <div className="h-px bg-olive-900/10 my-2" />
                            <div className="flex justify-between items-center bg-olive-900 p-3 rounded-xl text-sand-50">
                                <span className="text-sm font-medium opacity-80">Valor a Reembolsar:</span>
                                <span className="text-xl font-black">R$ {previewData.refundAmount.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-olive-900/40 text-center italic">
                                {previewData.refundPercentage === 100 ? "Reembolso total garantido." :
                                    previewData.refundPercentage === 0 ? "Esta reserva não permite reembolso neste prazo." :
                                        `Reembolso parcial de ${previewData.refundPercentage}% conforme política.`}
                            </p>
                        </div>

                        <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <Info className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Atenção:</strong> Ao confirmar, o calendário será liberado e o reembolso será processado automaticamente pelo Mercado Pago. Esta ação não pode ser desfeita.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} disabled={isCancelling} className="rounded-xl flex-1">
                        Manter Reserva
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isCancelling || !previewData?.canCancel}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex-1 gap-2"
                    >
                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirmar Cancelamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
