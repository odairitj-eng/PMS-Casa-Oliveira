import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                olive: {
                    50: '#f0f4f2',
                    900: '#103020', // Verde escuro principal
                    800: '#1a4d33',
                },
                petrol: {
                    50: '#f1f5f9', // Cinza petróleo bem claro (Slate-ish)
                },
                sage: {
                    400: '#99CD85', // Verde sage solicitado pelo usuário
                    50: '#eef7ea',  // Versão clara do sage para textos
                },
                sand: {
                    100: '#F0E0D0', // Bege claro
                    50: '#F5EBE1',
                }
            },
        },
    },
    plugins: [],
};
export default config;
