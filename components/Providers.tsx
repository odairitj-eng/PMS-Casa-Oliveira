"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((reg) => console.log("SW registrado:", reg))
                    .catch((err) => console.log("SW erro:", err));
            });
        }
    }, []);

    return <SessionProvider>{children}</SessionProvider>;
}
