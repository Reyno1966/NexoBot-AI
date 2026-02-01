"use client";
import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        setError('');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');

        try {
            const response = await fetch(`${apiUrl}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    new_password: password
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                setError(data.detail || 'Error al restablecer la contraseña');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-white text-center">
                <h1 className="text-2xl font-bold mb-4">Token Inválido</h1>
                <p className="text-slate-400 mb-6">El enlace ha expirado o no es válido.</p>
                <button onClick={() => router.push('/')} className="text-cyan-400 font-bold flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} /> Volver al Inicio
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                    <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¡Éxito!</h3>
                <p className="text-slate-400 text-sm">Tu contraseña ha sido actualizada. Serás redirigido al login...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Nueva Contraseña</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all text-white"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Confirmar Nueva Contraseña</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400" size={20} />
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition-all text-white"
                    />
                </div>
            </div>

            {error && (
                <div className="text-xs p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
                    {error}
                </div>
            )}

            <button
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>Actualizar Contraseña <ChevronRight size={20} /></>
                )}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#181a1f]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative z-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-2xl shadow-cyan-500/20">
                            <img src="/logo.jpg" alt="NexoBot" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Nueva Contraseña</h2>
                        <p className="text-slate-400 text-sm text-center">Configura tu nueva clave de acceso seguro.</p>
                    </div>

                    <Suspense fallback={<div className="text-white text-center">Cargando...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
