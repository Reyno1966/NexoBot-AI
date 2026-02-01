export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#0f1115" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className="bg-[#0f1115] antialiased text-slate-200">
                {children}
            </body>
        </html>
    );
}
