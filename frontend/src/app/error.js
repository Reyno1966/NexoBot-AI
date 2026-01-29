"use client";
import React, { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Critical Client Exception:", error);
    }, [error]);

    const handleReset = () => {
        // Clear local storage as a drastic measure if it's causing the problem
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
        }
        // Attempt to recover by re-rendering the segment
        reset();
        // Redirect to home
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4">
            <div className="bg-[#181a1f] border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Ups! Algo salió mal</h2>
                <p className="text-slate-400 text-sm mb-8">
                    La aplicación ha detectado un error inesperado. Esto puede deberse a datos antiguos en el navegador.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={handleReset}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
                    >
                        Limpiar y Reiniciar App
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-2xl transition-all"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        </div>
    );
}
