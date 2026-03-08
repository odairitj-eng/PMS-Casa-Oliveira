"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Copy, CalendarDays, Users, LayoutDashboard, Settings, TrendingUp, Building2, Globe } from "lucide-react";

export function SidebarNav() {
    const pathname = usePathname();

    const menuItems = [
        { href: "/admin/dashboard", label: "Visão Geral", icon: LayoutDashboard },
        { href: "/admin/calendar", label: "Calendário", icon: CalendarDays },
        { href: "/admin/pricing", label: "Smart Pricing", icon: TrendingUp },
        { href: "/admin/properties", label: "Imóveis", icon: Building2 },
        { href: "/admin/guests", label: "Hóspedes & CRM", icon: Users },
        { href: "/admin/integrations", label: "Integrações & API", icon: Globe },
        { href: "/admin/settings", label: "Configurações", icon: Settings },
    ];

    return (
        <nav className="mt-6 px-4 space-y-2">
            {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                            ? "bg-olive-800/50 text-white shadow-inner"
                            : "text-sand-50/70 hover:text-white hover:bg-olive-800/30"
                            }`}
                    >
                        <Icon className={`w-5 h-5 ${isActive ? "text-sand-100" : ""}`} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
