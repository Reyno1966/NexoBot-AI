"use client";
import React, { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error("CRASH DETECTADO:", error);
    }, [error]);

    const brutalReset = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
            // Limpieza de cookies básica
            document.cookie.split(";").forEach((c) => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            // Redirección con cache-buster para forzar recarga de scripts
            window.location.href = '/?clear=' + Date.now();
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
            <div className="max-w-xl w-full bg-[#111] border-2 border-red-500 rounded-[3rem] p-12 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <span className="text-white text-4xl font-black">!</span>
                </div>

                <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Falla de Integridad</h1>
                <p className="text-slate-400 mb-8 text-sm font-medium">
                    El sistema ha detectado un error técnico. Copia el código de abajo para que yo pueda repararlo:
                </p>

                <div className="bg-red-950/30 border border-red-500/30 p-6 rounded-2xl mb-10 text-left overflow-hidden">
                    <p className="text-[9px] font-black uppercase text-red-500 mb-2 tracking-widest">Código de Error:</p>
                    <code className="text-red-400 font-mono text-[11px] break-all block leading-tight">
                        {error?.message || "Error desconocido de renderizado"}
                    </code>
                    {error?.stack && (
                        <div className="mt-4 pt-4 border-t border-red-500/10 h-24 overflow-y-auto">
                            <p className="text-[8px] text-red-700 font-mono">{error.stack}</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={brutalReset}
                        className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-95 transition-all"
                    >
                        Limpiar y Volver al Inicio
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-white/5 text-slate-500 font-bold uppercase text-[10px] rounded-2xl"
                    >
                        Reintentar Carga
                    </button>
                </div>
            </div>
        </div>
    );
}
