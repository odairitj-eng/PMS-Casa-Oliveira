"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2, User, Calendar, Home, CreditCard } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReservationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: any;
    onSuccess: () => void;
}

export function ReservationDetailsModal({ isOpen, onClose, reservation, onSuccess }: ReservationDetailsModalProps) {
    const [isCancelling, setIsCancelling] = useState(false);
    const [processRefund, setProcessRefund] = useState(true);

    if (!reservation) return null;

    const handleCancel = async () => {
        setIsCancelling(true);
        const tId = toast.loading("Processando cancelamento...");
        try {
            await axios.post(`/api/admin/reservations/${reservation.id}/cancel`, {
                processRefund
            });
            toast.success("Reserva cancelada com sucesso.", { id: tId });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Erro ao cancelar reserva.", { id: tId });
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg rounded-[2.5rem] border-0 shadow-2xl bg-[#F5EBE1]">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-olive-900 rounded-2xl shadow-lg">
                            <Calendar className="w-6 h-6 text-sand-50" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-olive-900">Detalhes da Reserva</DialogTitle>
                            <DialogDescription className="text-olive-900/60 font-bold">
                                Gerencie a reserva #{reservation.id.slice(-6)}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Info Card */}
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-olive-900/5 space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-olive-900/40 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-olive-900/40 uppercase tracking-widest">Hóspede</p>
                                <p className="font-bold text-olive-900">{reservation.guest?.name || "N/A"}</p>
                                <p className="text-xs text-olive-900/60">{reservation.guest?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-olive-900/40 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-olive-900/40 uppercase tracking-widest">Período</p>
                                <p className="font-bold text-olive-900">
                                    {format(new Date(reservation.checkIn), "dd/MM/yy")} a {format(new Date(reservation.checkOut), "dd/MM/yy")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-olive-900/40 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-olive-900/40 uppercase tracking-widest">Valor Total</p>
                                <p className="font-bold text-olive-900 text-lg">R$ {reservation.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Section */}
                    {reservation.status === 'CONFIRMED' || reservation.status === 'PENDING_PAYMENT' ? (
                        <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 space-y-4">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <h4 className="font-black text-sm uppercase tracking-wider">Zona de Cancelamento</h4>
                            </div>

                            <p className="text-xs text-red-600 leading-relaxed font-medium">
                                Operação irreversível. O calendário será liberado e o hóspede será notificado.
                            </p>

                            <div className="bg-white/50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-olive-900">Processar Reembolso?</p>
                                    <p className="text-[10px] text-olive-900/60">Via Mercado Pago automático</p>
                                </div>
                                <button
                                    onClick={() => setProcessRefund(!processRefund)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${processRefund ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${processRefund ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <Button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 font-black gap-2 shadow-lg shadow-red-900/10"
                            >
                                {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cancelar Esta Reserva"}
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 bg-olive-900/5 rounded-[2rem] text-center italic text-olive-900/40 text-sm">
                            Esta reserva está com status <strong>{reservation.status}</strong> e não pode ser cancelada.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="rounded-xl w-full text-olive-900 font-bold">
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
