import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Casa Oliveira - Reserva Direta',
    description: 'Sistema de reserva direta e gerenciamento para a Casa Oliveira.',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Casa Oliveira',
    },
    icons: {
        icon: '/icons/icon-192x192.png',
        shortcut: '/icons/icon-192x192.png',
        apple: '/icons/icon-192x192.png',
    },
};

import type { Viewport } from 'next';
export const viewport: Viewport = {
    themeColor: '#103020',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <Providers>
                    <Header />
                    {children}
                    <InstallPrompt />
                    <Toaster position="bottom-right" />
                </Providers>
            </body>
        </html>
    );
}
