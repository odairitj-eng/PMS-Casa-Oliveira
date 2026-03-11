import { notFound } from 'next/navigation';
import { Gallery } from '@/components/booking/Gallery';
import { BookingCard } from '@/components/booking/BookingCard';
import { Amenities } from '@/components/booking/Amenities';
import { PropertyDescription } from '@/components/booking/PropertyDescription';
import { MapSection } from '@/components/booking/MapSection';
import { MapPin, ShieldAlert } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

// Helper for dynamic rule icons
const RuleIconComponent = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (LucideIcons as any)[name] || ShieldAlert;
    return <Icon className={className} />;
};

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const property = await db.property.findUnique({
        where: { slug },
        select: { publicTitle: true, name: true, shortDescription: true },
    });
    return {
        title: property?.publicTitle || property?.name || 'Casa Oliveira',
        description: property?.shortDescription || undefined,
    };
}

export default async function PropertyPage({ params }: Props) {
    const { slug } = await params;
    const property = await db.property.findUnique({
        where: { slug },
        include: {
            photos: {
                orderBy: [
                    { isPrimary: 'desc' },
                    { sortOrder: 'asc' }
                ]
            },
            amenities: { orderBy: { sortOrder: 'asc' } },
            rules: { orderBy: { sortOrder: 'asc' } },
        },
    });

    if (!property || !property.isActive) {
        notFound();
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Title Section */}
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-olive-900 mb-2">
                    {property.publicTitle || property.name}
                </h1>
                {property.publicSubtitle && (
                    <h2 className="text-xl text-olive-900/80 mb-3">{property.publicSubtitle}</h2>
                )}
                <div className="flex items-center gap-4 text-olive-900/80 font-medium text-sm md:text-base">
                    <a href="#localizacao" className="flex items-center gap-1 underline decoration-1 underline-offset-4 cursor-pointer">
                        <MapPin className="w-5 h-5 font-bold" />
                        {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city} — {property.state}, {property.country}
                    </a>
                </div>
            </div>

            <Gallery photos={property.photos} />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column - Details */}
                <div className="md:col-span-2 space-y-8">

                    <div className="flex justify-between items-start border-b border-olive-900/10 pb-8">
                        <div>
                            <h2 className="text-2xl font-bold">
                                {(() => {
                                    const typeLabels: Record<string, string> = {
                                        HOUSE: 'Casa',
                                        TOWNHOUSE: 'Townhouse',
                                        BUNGALOW: 'Bangalô',
                                        CABIN: 'Cabana',
                                        CHALET: 'Chalé',
                                        EARTH_HOUSE: 'Casa na terra',
                                        HUT: 'Casebre',
                                        LIGHTHOUSE: 'Torre de farol',
                                        VILLA: 'Vila',
                                        DOME_HOUSE: 'Casa de cúpula',
                                        FARMHOUSE: 'Casa de campo',
                                        FARM_HOTEL: 'Hotel-fazenda',
                                        HOUSEBOAT: 'Casa flutuante',
                                        TINY_HOUSE: 'Microcasa',
                                    };

                                    const type = property.propertyType || 'HOUSE';
                                    const label = typeLabels[type] || 'Imóvel';

                                    let accommodation = property.accommodationType || 'Espaço inteiro';
                                    if (accommodation === 'Espaço inteiro') {
                                        const isMasculine = ['BUNGALOW', 'CHALET', 'HUT', 'FARM_HOTEL'].includes(type);
                                        accommodation = isMasculine ? 'inteiro' : 'inteira';
                                    }

                                    return `${label} ${accommodation}`;
                                })()} | Hospedado por {property.hostName || 'Anfitrião'}
                            </h2>
                            <p className="text-olive-900/80 mt-1">
                                {property.maxGuests} {property.maxGuests > 1 ? 'hóspedes' : 'hóspede'} ·{' '}
                                {property.bedrooms} {property.bedrooms > 1 ? 'quartos' : 'quarto'} ·{' '}
                                {property.beds} {property.beds > 1 ? 'camas' : 'cama'} ·{' '}
                                {property.bathrooms} {property.bathrooms > 1 ? 'banheiros' : 'banheiro'}
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-olive-900 flex items-center justify-center text-sand-50 font-bold text-xl ring-2 ring-offset-2 ring-olive-900/10">
                            {property.hostName ? property.hostName[0].toUpperCase() : 'A'}
                        </div>
                    </div>

                    <div id="a-casa" className="scroll-mt-24">
                        <PropertyDescription
                            shortDescription={property.shortDescription}
                            fullDescription={property.fullDescription}
                        />
                    </div>

                    <div id="comodidades" className="scroll-mt-24">
                        <Amenities amenities={property.amenities} />
                    </div>

                    <div id="regras" className="py-8 border-t border-olive-900/10 scroll-mt-24">
                        <h2 className="text-2xl font-bold mb-4">Regras da casa</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {property.rules.length > 0 ? (
                                property.rules.map((rule: any) => (
                                    <div key={rule.id} className="flex items-center gap-3 text-olive-900/80 text-lg">
                                        <RuleIconComponent name={rule.iconName || 'ShieldAlert'} className="w-5 h-5 opacity-70" />
                                        <span>{rule.ruleText}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-olive-900/50">Nenhuma regra da casa cadastrada.</p>
                            )}
                        </div>
                    </div>

                    <MapSection
                        latitude={property.publicLatitude || property.latitude}
                        longitude={property.publicLongitude || property.longitude}
                        neighborhood={property.neighborhood}
                        city={property.city}
                        state={property.state}
                        country={property.country}
                    />
                </div>

                {/* Right Column - Booking Card */}
                <div id="reserva" className="md:col-span-1 relative order-first md:order-last mb-10 md:mb-0 scroll-mt-24">
                    <BookingCard
                        propertyId={property.id}
                        maxGuests={property.maxGuests}
                        allowsPets={property.allowsPets}
                        maxPets={property.maxPets}
                    />
                </div>
            </div>

            {/* Mobile Booking Bottom Bar (Fixed) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-olive-900/10 flex justify-between items-center z-[100]">
                <div>
                    <div className="flex items-end gap-1">
                        <span className="font-bold text-lg">R$ {property.basePrice}</span>
                        <span className="text-sm font-medium text-olive-900/60 pb-[2px]">noite</span>
                    </div>
                </div>
                <a href="#reserva" className="bg-olive-900 text-sand-50 px-8 py-3 rounded-xl font-bold text-lg hover:bg-olive-800 transition-colors">
                    Reservar
                </a>
            </div>
        </main>
    );
}
