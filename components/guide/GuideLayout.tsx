"use client";

import React from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

interface GuideLayoutProps {
    children: React.ReactNode;
    accentColor?: string;
}

export default function GuideLayout({ children, accentColor }: GuideLayoutProps) {
    return (
        <div className={cn(
            "min-h-screen bg-[#F5EBE1] text-olive-900 selection:bg-olive-900 selection:text-sand-50",
            inter.className
        )}>
            <style jsx global>{`
        .font-editorial {
          font-family: ${playfair.style.fontFamily}, serif;
        }
        .text-accent {
          color: ${accentColor || '#103020'};
        }
        .bg-accent {
          background-color: ${accentColor || '#103020'};
        }
      `}</style>

            <main className="max-w-md mx-auto min-h-screen bg-[#F5EBE1] shadow-2xl overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
