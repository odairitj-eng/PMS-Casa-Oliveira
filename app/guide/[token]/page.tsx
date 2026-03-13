"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GuideLayout from "@/components/guide/GuideLayout";
import GuideHeader from "@/components/guide/GuideHeader";
import GuideSectionCard from "@/components/guide/GuideSectionCard";
import GuidePlaceCard from "@/components/guide/GuidePlaceCard";
import GuideNavigation from "@/components/guide/GuideNavigation";
import ConciergeHome from "@/components/guide/ConciergeHome";
import GuidedCheckIn from "@/components/guide/GuidedCheckIn";
import ConciergeAssistant from "@/components/guide/ConciergeAssistant";
import { Loader2 } from "lucide-react";

export default function GuestGuidePage() {
    const params = useParams();
    const token = params.token as string;
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [assistantMode, setAssistantMode] = useState<any>("help-center");

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/guide/${token}`);
                if (!response.ok) {
                    throw new Error("Não foi possível carregar o guia.");
                }
                const json = await response.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchGuide();
        }
    }, [token]);

    const handleAction = (id: string) => {
        // Mapeamento de Atalhos Especiais / Modais
        if (id === "guided-checkin") {
            setIsCheckInOpen(true);
            return;
        }

        if (["help", "problem", "help-center"].includes(id)) {
            setAssistantMode("help-center");
            setIsAssistantOpen(true);
            return;
        }

        if (id === "house-manual") {
            setAssistantMode("house-manual");
            setIsAssistantOpen(true);
            return;
        }

        if (id === "space-tour") {
            setAssistantMode("space-tour");
            setIsAssistantOpen(true);
            return;
        }

        // Scroll para Seções (ID da Seção no DB)
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            return;
        }

        // Caso o ID seja um SectionType amigável (mapeado no GuiaNavigation ou similar)
        // Tentamos encontrar a primeira seção desse tipo
        if (data?.guide?.sections) {
            const section = data.guide.sections.find((s: any) => s.type === id.toUpperCase());
            if (section) {
                const secEl = document.getElementById(section.id);
                if (secEl) {
                    secEl.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5EBE1] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-olive-900" size={48} />
                    <p className="font-editorial text-xl italic text-olive-800">Preparando sua recepção...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#F5EBE1] flex items-center justify-center p-8 text-center">
                <div>
                    <h1 className="font-editorial text-4xl text-olive-900 mb-4">Ops!</h1>
                    <p className="text-olive-800/70 mb-8">{error || "Guia não encontrado."}</p>
                    <a href="/" className="px-8 py-3 bg-olive-900 text-sand-50 rounded-full text-xs uppercase tracking-widest font-bold">
                        Voltar ao Início
                    </a>
                </div>
            </div>
        );
    }

    const { property, guide, guest, type, reservation } = data;
    const primaryPhoto = property.photos?.[0]?.imageUrl;

    return (
        <GuideLayout accentColor={guide.accentColor}>
            {/* 1. Capa / Entradas Alternativas */}
            {type === "PRIVATE" ? (
                <>
                    <ConciergeHome
                        guestName={guest?.name}
                        reservation={reservation}
                        property={property}
                        accentColor={guide.accentColor}
                        onNavigate={handleAction}
                    />
                    <GuidedCheckIn
                        isOpen={isCheckInOpen}
                        onClose={() => setIsCheckInOpen(false)}
                        property={property}
                    />
                    <ConciergeAssistant
                        isOpen={isAssistantOpen}
                        onClose={() => setIsAssistantOpen(false)}
                        moduleType={assistantMode}
                        property={property}
                    />
                </>
            ) : (
                <GuideHeader
                    propertyName={property.publicTitle || property.name}
                    locationText={property.locationText}
                    imageUrl={primaryPhoto}
                    welcomeMessage={guest ? `Bem-vindo, ${guest.name.split(' ')[0]}!` : "Bem-vindo!"}
                />
            )}

            {/* 2. Conteúdo Modular */}
            <div id="content" className="pb-24">
                {guide.sections.map((section: any) => (
                    <div key={section.id} id={section.id}>
                        <GuideSectionCard
                            type={section.type}
                            title={section.title}
                            content={section.content}
                            imageUrl={section.imageUrl}
                            iconName={section.iconName}
                            config={section.config}
                        />
                    </div>
                ))}

                {/* 3. Guia da Região (Places) */}
                {guide.places.length > 0 && (
                    <div id="region-guide" className="px-6 py-12">
                        <header className="mb-12 border-b-4 border-olive-900/5 pb-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-olive-800/40 font-bold block mb-2">Descubra</span>
                            <h2 className="font-editorial text-5xl text-olive-900">Na Região</h2>
                        </header>

                        {guide.places.map((place: any) => (
                            <GuidePlaceCard
                                key={place.id}
                                name={place.name}
                                category={place.category}
                                description={place.description}
                                imageUrl={place.imageUrl}
                                distance={place.distance}
                                googleMapsUrl={place.googleMapsUrl}
                            />
                        ))}
                    </div>
                )}

                {/* 4. Rodapé Pessoal */}
                <footer className="mt-24 mb-32 px-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-md">
                        <span className="font-editorial text-2xl text-olive-900">CO</span>
                    </div>
                    <p className="font-editorial text-xl italic text-olive-900/80 mb-2">Casa Oliveira</p>
                    <p className="text-[10px] uppercase tracking-widest text-olive-800/40 font-bold">Hospitalidade de Coração</p>
                </footer>
            </div>

            {/* 5. Navegação Flutuante */}
            <GuideNavigation
                sections={[
                    ...guide.sections.map((s: any) => ({ id: s.id, title: s.title })),
                    ...(guide.places.length > 0 ? [{ id: "region-guide", title: "Guia da Região" }] : [])
                ]}
                isConcierge={type === "PRIVATE"}
            />
        </GuideLayout>
    );
}
