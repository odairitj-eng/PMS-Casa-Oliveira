"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function Gallery({ photos = [] }: { photos?: any[] }) {
    const [showModal, setShowModal] = useState(false);

    if (!photos || photos.length === 0) {
        return (
            <div className="w-full h-[300px] md:h-[500px] bg-olive-900/10 rounded-2xl flex items-center justify-center text-olive-900/50 font-medium font-inter">
                Nenhuma foto cadastrada
            </div>
        );
    }

    const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
    const otherPhotos = photos.filter(p => p.id !== primaryPhoto?.id).slice(0, 4);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[500px]">
                {/* Foto Principal */}
                <div
                    className="col-span-1 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden bg-olive-900/10"
                    onClick={() => setShowModal(true)}
                >
                    <div className="absolute inset-0 bg-olive-900/20 group-hover:bg-transparent transition-colors z-10" />
                    <Image
                        src={primaryPhoto.imageUrl}
                        alt="Foto Principal do Imóvel"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>

                {/* Outras Fotos */}
                {otherPhotos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden bg-olive-900/10"
                        onClick={() => setShowModal(true)}
                    >
                        <div className="absolute inset-0 bg-olive-900/20 group-hover:bg-transparent transition-colors z-10" />
                        <Image
                            src={photo.imageUrl}
                            alt={`Foto lateral ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 16vw"
                            className="object-cover"
                        />

                        {/* Botão de "Mostrar todas" na última miniatura visível */}
                        {index === 3 && photos.length > 5 && (
                            <div className="absolute inset-0 z-20 flex items-end justify-end p-4">
                                <div className="bg-white/90 backdrop-blur text-sm font-bold px-4 py-2 rounded-xl text-olive-900 border border-olive-900/10 shadow-sm pointer-events-none">
                                    Mostrar todas as {photos.length} fotos
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal de Galeria Full Screen */}
            {showModal && (
                <div className="fixed inset-0 z-[99999] bg-white flex flex-col overflow-hidden animate-in fade-in duration-300">
                    <div className="p-4 md:p-6 flex items-center justify-between border-b border-olive-900/10 bg-white sticky top-0 z-[100000]">
                        <button
                            onClick={() => setShowModal(false)}
                            className="p-2 hover:bg-olive-900/5 rounded-full transition-colors text-olive-900 focus:outline-none"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <div className="font-bold text-xl text-olive-900">
                            Galeria de Fotos
                        </div>
                        <div className="w-12" /> {/* Spacer */}
                    </div>

                    <div className="flex-1 overflow-y-auto w-full p-4 md:p-12 bg-sand-50/30">
                        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            {photos.map((photo, idx) => (
                                <div key={photo.id || idx} className="relative aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden bg-olive-900/5 shadow-md">
                                    <Image
                                        src={photo.imageUrl}
                                        alt={`Foto ampliada ${idx + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
