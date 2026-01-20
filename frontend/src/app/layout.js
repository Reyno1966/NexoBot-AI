import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "NexoBot AI | Tu Asistente de Negocios Inteligente",
    description: "El cerebro operativo para emprendedores modernos. Gestiona citas, facturas y stock con el poder de Gemini 2.0 Flash.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#0f1115" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className={`${inter.className} bg-[#0f1115]`}>
                {children}
            </body>
        </html>
    );
}
