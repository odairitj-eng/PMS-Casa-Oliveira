"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
import { SidebarNav } from "@/components/admin/SidebarNav";
import { Menu, X, LayoutDashboard, CalendarDays, Users, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    const bottomNavItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Início" },
        { href: "/admin/calendar", icon: CalendarDays, label: "Agenda" },
        { href: "/admin/guests", icon: Users, label: "CRM" },
    ];

    return (
        <div className="min-h-screen bg-sand-50/50 flex flex-col md:flex-row pb-20 md:pb-0">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-olive-900 border-r border-olive-800 text-sand-50 flex-col flex-shrink-0 sticky top-0 h-screen">
                <div className="p-6 border-b border-olive-800/50 flex flex-col items-center pt-8 text-center">
                    <div className="rounded-2xl overflow-hidden inline-flex w-fit mb-4 mx-auto shadow-lg shadow-black/20">
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

            {/* Mobile Sidebar/Drawer */}
            <div className={cn(
                "fixed inset-0 z-[60] bg-olive-900 transition-all duration-300 md:hidden flex flex-col",
                isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
            )}>
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase text-[10px] opacity-40">Menu Principal</h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-white/50 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto" onClick={() => setIsSidebarOpen(false)}>
                    <SidebarNav />
                </div>
            </div>

            <main className="flex-1 min-h-screen">
                {/* Admin Top Bar */}
                <header className="h-16 md:h-20 border-b border-olive-900/5 bg-white/70 backdrop-blur-md px-6 md:px-12 flex justify-between items-center sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-olive-900/5 rounded-xl text-olive-900 md:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-[10px] font-black text-olive-900 uppercase tracking-[0.2em] opacity-30">Painel de Controle</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider hidden sm:block">Sistema Online</div>
                        <UserMenu />
                    </div>
                </header>

                <div className="p-6 md:p-12">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-olive-900/5 px-6 flex items-center justify-around md:hidden z-50">
                {bottomNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 flex-1 transition-all active:scale-90",
                                isActive ? "text-olive-900 scale-110" : "text-olive-900/40"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all",
                                isActive ? "bg-olive-900/5" : ""
                            )}>
                                <Icon className={cn(
                                    "w-6 h-6",
                                    isActive ? "fill-current" : ""
                                )} />
                            </div>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex flex-col items-center gap-1 text-olive-900/30"
                >
                    <div className="p-2">
                        <MoreHorizontal className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Mais</span>
                </button>
            </nav>
        </div>
    );
}
