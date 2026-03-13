import { db } from "@/lib/db";
import { Home, Globe, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function AdminGuideSelectionPage() {
    const properties = await db.property.findMany({
        where: { isActive: true },
        include: {
            guide: true,
        },
        orderBy: { name: "asc" },
    });

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-olive-900 flex items-center gap-3">
                    <BookOpen className="text-olive-800" />
                    Guia do Hóspede
                </h1>
                <p className="text-olive-800/60 mt-2">
                    Selecione uma propriedade para configurar o seu manual digital personalizado.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <Link
                        key={property.id}
                        href={`/admin/properties/${property.id}/guide`}
                        className="group bg-white rounded-3xl p-6 border border-olive-900/5 shadow-sm hover:shadow-md transition-all hover:border-olive-800/20 flex flex-col justify-between h-56"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-olive-50 flex items-center justify-center text-olive-900 transition-colors group-hover:bg-olive-800 group-hover:text-white">
                                    <Home size={24} />
                                </div>
                                {(property as any).guide ? (
                                    <span className="bg-sage-50 text-olive-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-sage-400/20">
                                        Configurado
                                    </span>
                                ) : (
                                    <span className="bg-sand-50 text-olive-800/60 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                        Pendente
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-olive-900 group-hover:text-olive-800 transition-colors">
                                {property.name}
                            </h2>
                            <p className="text-sm text-olive-800/60 line-clamp-2 mt-2">
                                {property.locationText || `${property.city}, ${property.state}`}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-olive-900/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-olive-800/40">
                                {(property as any).guide?.sectionsCount ?? 0} Seções
                            </span>
                            <div className="flex items-center gap-2 text-olive-800 font-bold text-xs uppercase tracking-widest">
                                Gerenciar <ArrowRight size={14} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
