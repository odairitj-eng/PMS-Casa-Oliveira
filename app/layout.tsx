import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Casa Oliveira - Reserva Direta',
    description: 'Sistema de reserva direta e gerenciamento para a Casa Oliveira.',
};

import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";

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
                    <Toaster position="bottom-right" />
                </Providers>
            </body>
        </html>
    );
}
