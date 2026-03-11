"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, ArrowLeft, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

function CheckoutContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    const propertyId = searchParams.get("propertyId") || "casa-oliveira-id";
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guestsCount = searchParams.get("guests") || "1";

    const [guestData, setGuestData] = useState<any>(null);
    const [propertyData, setPropertyData] = useState<any>(null);
    const [phone, setPhone] = useState("");
    const [pricing, setPricing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pixData, setPixData] = useState<any>(null);
    const [occupants, setOccupants] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");

    useEffect(() => {
        // Inicializar array de ocupantes baseado no número de hóspedes (excluindo o organizador)
        const count = parseInt(guestsCount);
        if (count > 1) {
            setOccupants(Array(count - 1).fill({ name: "", document: "" }));
        }
    }, [guestsCount]);

    useEffect(() => {
        if (status === "authenticated" && checkIn && checkOut) {
            const fetchData = async () => {
                try {
                    const [guestRes, pricingRes, propertyRes] = await Promise.all([
                        axios.get("/api/guests/me"),
                        axios.get(`/api/pricing?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`),
                        axios.get(`/api/property/${propertyId}/public`)
                    ]);
                    setGuestData(guestRes.data);
                    setPhone(guestRes.data.phone || "");
                    setPricing(pricingRes.data);
                    setPropertyData(propertyRes.data);
                } catch (error) {
                    console.error("Erro ao carregar dados", error);
                    toast.error("Erro ao carregar informações da reserva.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [status, checkIn, checkOut, propertyId, router, searchParams]);

    // Proteção extra via cliente
    if (status === "unauthenticated") {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        router.replace(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`);
        return null;
    }

    const handleSubmit = async () => {
        if (!phone) {
            toast.error("O telefone é obrigatório para confirmar a reserva.");
            return;
        }

        setIsSubmitting(true);
        const idToast = toast.loading("Finalizando sua reserva...");

        try {
            const response = await axios.post("/api/reservations", {
                propertyId,
                checkIn,
                checkOut,
                guestName: session?.user?.name,
                guestEmail: session?.user?.email,
                guestPhone: phone,
                totalAmount: pricing.total,
                nightlyRate: pricing.total / pricing.breakdown.length,
                cleaningFee: pricing.cleaningFee,
                totalNights: pricing.breakdown.length,
                guests: parseInt(guestsCount),
                occupants: occupants.filter(o => o.name),
                paymentMethod // Novo campo
            });

            if (paymentMethod === "PIX") {
                toast.success("Reserva realizada com sucesso!", { id: idToast });
                setPixData(response.data.pix);
            } else {
                toast.success("Redirecionando para pagamento seguro...", { id: idToast });
                // Supondo que o backend retornará a URL de checkout se for Card
                if (response.data.checkoutUrl) {
                    window.location.href = response.data.checkoutUrl;
                } else {
                    toast.error("Erro ao gerar link de pagamento.");
                }
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || "Erro ao processar reserva.";
            toast.error(msg, { id: idToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sand-50">
                <Loader2 className="w-10 h-10 animate-spin text-olive-900" />
            </div>
        );
    }

    if (pixData) {
        return (
            <div className="min-h-screen bg-sand-50 py-12 px-4">
                <Card className="max-w-xl mx-auto shadow-2xl rounded-[2rem] overflow-hidden border-0">
                    <div className="bg-olive-900 p-8 text-center text-white relative">
                        <div className="absolute top-6 left-8 bg-white rounded-xl p-1.5 shadow-lg">
                            <Image src="/imagens/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                        </div>
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
                        <h1 className="text-3xl font-bold">Reserva Quase Pronta!</h1>
                        <p className="opacity-80 mt-2">Damos um &quot;hold&quot; nas datas por 30 minutos enquanto você paga.</p>
                    </div>
                    <CardContent className="p-10 space-y-8">
                        <div className="text-center">
                            <p className="text-olive-900/60 font-medium mb-4 uppercase tracking-widest text-xs">Escaneie o QR Code PIX</p>
                            <div className="bg-white p-6 inline-block rounded-3xl border-2 border-olive-900/5 shadow-inner">
                                {/* Aqui viria o QR Code dinâmico do Mercado Pago */}
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-2xl">
                                    <span className="text-gray-400 text-xs font-mono break-all p-4">{pixData.qr_code.substring(0, 100)}...</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-olive-900/60 font-bold block text-center uppercase text-[10px] tracking-widest">Ou copie o código</Label>
                            <div className="flex gap-2">
                                <Input readOnly value={pixData.qr_code} className="font-mono text-xs h-12 bg-sand-50" />
                                <Button onClick={() => { navigator.clipboard.writeText(pixData.qr_code); toast.success("Copiado!"); }} variant="outline" className="h-12 px-6 rounded-xl border-olive-900/20">Copiar</Button>
                            </div>
                        </div>

                        <Button onClick={() => router.push("/")} className="w-full h-14 bg-olive-900 text-sand-50 rounded-2xl font-bold text-lg hover:bg-olive-800 transition-all shadow-lg">
                            Voltar ao Site
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sand-50 py-12 px-4 bg-[url('/imagens/pattern.png')] bg-repeat">
            <div className="max-w-5xl mx-auto mb-8 flex justify-center lg:justify-start">
                <Link href="/">
                    <Image src="/imagens/logo.png" alt="Casa Oliveira" width={150} height={50} className="object-contain hover:opacity-80 transition-opacity" />
                </Link>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna Esquerda: Dados Hóspede */}
                <div className="lg:col-span-2 space-y-6">
                    <Button variant="ghost" onClick={() => router.back()} className="text-olive-900 font-bold hover:bg-olive-900/5 -ml-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>

                    <Card className="rounded-[2.5rem] shadow-xl border-0 overflow-hidden">
                        <CardHeader className="bg-olive-900/5 p-8 border-b border-olive-900/10">
                            <CardTitle className="text-2xl font-bold text-olive-900">Confirme seus dados</CardTitle>
                            <CardDescription className="text-olive-900/60 font-medium">Seus dados sociais foram preenchidos automaticamente.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="font-bold text-olive-900 mb-2 block">Nome Completo</Label>
                                    <Input disabled value={session?.user?.name || ""} className="bg-sand-50/50 h-12 rounded-xl border-olive-900/10" />
                                </div>
                                <div>
                                    <Label className="font-bold text-olive-900 mb-2 block">Email</Label>
                                    <Input disabled value={session?.user?.email || ""} className="bg-sand-50/50 h-12 rounded-xl border-olive-900/10" />
                                </div>
                            </div>

                            <div>
                                <Label className="font-bold text-olive-900 mb-2 block">Telefone / WhatsApp (Obrigatório)</Label>
                                <Input
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="h-14 rounded-2xl border-olive-900/20 focus:border-olive-900 text-lg md:text-base"
                                />
                                <p className="text-xs text-olive-900/40 font-medium mt-2">Usaremos este número apenas para comunicações sobre sua reserva.</p>
                            </div>

                            <div className="pt-8 border-t border-olive-900/5">
                                <Label className="font-bold text-olive-900 mb-4 block">Forma de Pagamento</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setPaymentMethod("PIX")}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${paymentMethod === "PIX" ? "border-olive-900 bg-olive-900/5" : "border-olive-900/10"}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "PIX" ? "border-olive-900" : "border-olive-900/20"}`}>
                                            {paymentMethod === "PIX" && <div className="w-2.5 h-2.5 bg-olive-900 rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-olive-900">Pix</p>
                                            <p className="text-[10px] text-olive-900/60 uppercase font-bold tracking-wider">Aprovação Imediata</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setPaymentMethod("CREDIT_CARD")}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${paymentMethod === "CREDIT_CARD" ? "border-olive-900 bg-olive-900/5" : "border-olive-900/10"}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "CREDIT_CARD" ? "border-olive-900" : "border-olive-900/20"}`}>
                                            {paymentMethod === "CREDIT_CARD" && <div className="w-2.5 h-2.5 bg-olive-900 rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-olive-900">Cartão de Crédito</p>
                                            <p className="text-[10px] text-olive-900/60 uppercase font-bold tracking-wider">Pagamento Seguro (MP)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {occupants.length > 0 && (
                                <div className="pt-8 border-t border-olive-900/5 space-y-6">
                                    <h3 className="font-bold text-olive-900 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Acompanhantes
                                    </h3>
                                    {occupants.map((occ, idx) => (
                                        <div key={idx} className="p-6 bg-olive-900/[0.02] rounded-2xl border border-olive-900/5 space-y-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-olive-900/40">Hóspede {idx + 2}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-bold text-olive-900/60 mb-1 block">Nome Completo</Label>
                                                    <Input
                                                        value={occ.name}
                                                        onChange={(e) => {
                                                            const newOccs = [...occupants];
                                                            newOccs[idx] = { ...newOccs[idx], name: e.target.value };
                                                            setOccupants(newOccs);
                                                        }}
                                                        className="h-10 rounded-xl border-olive-900/10 focus:border-olive-900"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-bold text-olive-900/60 mb-1 block">Documento (CPF/RG)</Label>
                                                    <Input
                                                        value={occ.document}
                                                        onChange={(e) => {
                                                            const newOccs = [...occupants];
                                                            newOccs[idx] = { ...newOccs[idx], document: e.target.value };
                                                            setOccupants(newOccs);
                                                        }}
                                                        className="h-10 rounded-xl border-olive-900/10 focus:border-olive-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-8 border-t border-olive-900/5 mt-8">
                                <div className="flex items-start gap-3 p-6 bg-green-50 rounded-2xl border border-green-100">
                                    <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                                    <div>
                                        <h4 className="text-green-900 font-bold text-sm">Reserva 100% Segura</h4>
                                        <p className="text-green-800/70 text-xs font-medium leading-relaxed mt-1">Sua conexão é criptografada e seus dados estão protegidos de acordo com a LGPD através de autenticação social verificada.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:block">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full h-16 mt-8 bg-olive-900 text-sand-50 rounded-2xl font-bold text-xl hover:bg-olive-800 transition-all shadow-xl active:scale-[0.98]"
                                >
                                    {isSubmitting ? "Processando..." : "Confirmar e Ir para Pagamento"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Direita: Resumo Financeiro */}
                <div className="lg:col-span-1">
                    <Card className="rounded-[2rem] shadow-lg border-0 sticky top-8 overflow-hidden">
                        <div className="aspect-video relative overflow-hidden bg-olive-900/5">
                            {propertyData?.photos?.[0]?.imageUrl ? (
                                <Image
                                    src={propertyData.photos[0].imageUrl}
                                    alt={propertyData.publicTitle || propertyData.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image src="/imagens/logo.png" alt="Logo" width={80} height={80} className="opacity-20 object-contain" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-olive-900/60 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-bold text-lg leading-tight">{propertyData?.publicTitle || propertyData?.name || "Casa Oliveira"}</p>
                                <p className="text-xs opacity-80">{propertyData?.city || "Campos do Jordão"}, {propertyData?.state || "SP"}</p>
                            </div>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-olive-900/5 p-4 rounded-xl">
                                    <div>
                                        <p className="text-[10px] font-bold text-olive-900/40 uppercase mb-1">Check-in</p>
                                        <p className="font-bold text-sm">{new Date(checkIn!).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-olive-900/40 uppercase mb-1">Checkout</p>
                                        <p className="font-bold text-sm">{new Date(checkOut!).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    {pricing?.breakdown.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs text-olive-900/60 font-medium">
                                            <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                                            <span>R$ {item.finalPrice}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs text-olive-900/60 font-medium pb-4 border-b border-olive-900/10">
                                        <span>Taxa de limpeza</span>
                                        <span>R$ {pricing?.cleaningFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl text-olive-900 pt-2 font-display">
                                        <span>Total</span>
                                        <span>R$ {pricing?.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Mobile Sticky CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-olive-900/5 p-4 z-50 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-olive-900/40 tracking-widest">Total</span>
                    <span className="text-xl font-black text-olive-900">R$ {pricing?.total.toFixed(2)}</span>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-14 bg-olive-900 text-sand-50 rounded-2xl font-bold text-base hover:bg-olive-800 transition-all shadow-xl active:scale-95"
                >
                    {isSubmitting ? "Reservar" : "Pagar Agora"}
                </Button>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-sand-50"><Loader2 className="w-10 h-10 animate-spin text-olive-900" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
