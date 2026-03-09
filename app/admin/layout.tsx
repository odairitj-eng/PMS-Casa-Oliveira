export const dynamic = 'force-dynamic';
import Image from "next/image";
import { UserMenu } from "@/components/auth/UserMenu";
import { SidebarNav } from "@/components/admin/SidebarNav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-sand-50/50 flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-olive-900 border-r border-olive-800 text-sand-50 flex-shrink-0 relative">
                <div className="p-6 border-b border-olive-800/50 flex flex-col items-center pt-8 text-center">
                    <div className="bg-sand-50 rounded-2xl p-2 inline-flex w-fit mb-4 mx-auto">
                        <Image
                            src="/imagens/logo.png"
                            alt="Casa Oliveira PMS"
                            width={100}
                            height={100}
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Casa Oliveira PMS</h2>
                </div>

                <SidebarNav />
            </aside>

            <main className="flex-1 min-h-screen overflow-y-auto">
                {/* Admin Top Bar */}
                <header className="h-20 border-b border-olive-900/5 bg-white/50 backdrop-blur-md px-8 md:px-12 flex justify-between items-center sticky top-0 z-40">
                    <h1 className="text-xl font-bold text-olive-900 uppercase tracking-widest text-xs opacity-50">Painel de Controle</h1>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider hidden sm:block">Sistema Online</div>
                        <UserMenu />
                    </div>
                </header>

                <div className="p-8 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
