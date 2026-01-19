"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, ChevronRight, Phone, MapPin, Globe, Scissors, Stethoscope, Gavel, Home, Hotel, Briefcase, Calendar, Clock, Star, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicChat({ params }) {
    const { tenant_id } = params;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [businessInfo, setBusinessInfo] = useState({
        name: 'Cargando...',
        industry: 'general',
        logoUrl: '/logo.jpg'
    });
    const scrollRef = useRef(null);

    useEffect(() => {
        // Cargar datos públicos del negocio
        const fetchBusiness = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexobot-ai.onrender.com';
                const response = await fetch(`${apiUrl}/api/v1/auth/public/tenant/${tenant_id}`);
                const data = await response.json();
                if (response.ok) {
                    setBusinessInfo({
                        name: data.name,
                        industry: data.industry,
                        logoUrl: data.logo_url || '/logo.jpg'
                    });
                }
            } catch (error) {
                console.error("Error al cargar negocio:", error);
            }
        };
        fetchBusiness();

        // Mensaje de bienvenida inicial
        setMessages([{
            role: 'assistant',
            text: `¡Hola! Soy el asistente virtual de este negocio. ¿En qué puedo ayudarte hoy?`
        }]);
    }, [tenant_id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${apiUrl}/api/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    tenant_id: tenant_id,
                    industry_override: businessInfo.industry
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Lo siento, tuve un problema al conectar. ¿Podrías reintentar?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full" />

            {/* Public Header */}
            <header className="p-6 bg-[#181a1f]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-500/30">
                        <img src={businessInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{businessInfo.name}</h1>
                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Asistente Virtual Activo
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                        <Phone size={20} />
                    </button>
                    <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                        <Globe size={20} />
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full scroll-smooth pt-8">
                {messages.map((msg, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-[#1e2126] border border-white/10'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-indigo-400" />}
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[85%] border shadow-xl ${msg.role === 'user'
                            ? 'bg-indigo-600 border-indigo-500 rounded-tr-none text-white'
                            : 'bg-[#1e2126] border-white/5 rounded-tl-none text-slate-100'
                            }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
                                    part.match(/^https?:\/\//) ? (
                                        <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="block mt-3 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-center shadow-lg transition-all">
                                            📥 Ver Documento
                                        </a>
                                    ) : part
                                )}
                            </p>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-[#1e2126] rounded-full flex items-center justify-center border border-white/10">
                            <Bot size={16} className="text-indigo-400" />
                        </div>
                        <div className="bg-[#1e2126] p-4 rounded-2xl rounded-tl-none border border-white/5 shadow-xl">
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Smart Tools Section - Dynamic based on Industry */}
            <div className="max-w-3xl mx-auto w-full px-4 mb-2">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {businessInfo.industry === 'barber' && (
                        <>
                            <button onClick={() => setInput("Ver catálogo de cortes")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-bold uppercase text-orange-400 hover:bg-orange-500/20 transition-all">
                                <Scissors size={14} /> Catálogo de Estilos
                            </button>
                            <button onClick={() => setInput("Precios de servicios")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-bold uppercase text-orange-400 hover:bg-orange-500/20 transition-all">
                                <Star size={14} /> Ver Precios
                            </button>
                        </>
                    )}
                    {businessInfo.industry === 'health' && (
                        <>
                            <button onClick={() => setInput("Agendar cita urgente")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] font-bold uppercase text-teal-400 hover:bg-teal-500/20 transition-all">
                                <Clock size={14} /> Cita Prioritaria
                            </button>
                            <button onClick={() => setInput("¿Qué seguros aceptan?")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] font-bold uppercase text-teal-400 hover:bg-teal-500/20 transition-all">
                                <Info size={14} /> Info Seguros
                            </button>
                        </>
                    )}
                    {businessInfo.industry === 'realestate' && (
                        <>
                            <button onClick={() => setInput("Ver propiedades disponibles")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase text-emerald-400 hover:bg-emerald-500/20 transition-all">
                                <Home size={14} /> Ver Catálogo
                            </button>
                            <button onClick={() => setInput("Solicitar valoración")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase text-emerald-400 hover:bg-emerald-500/20 transition-all">
                                <Zap size={14} /> Valorar mi Casa
                            </button>
                        </>
                    )}
                    {businessInfo.industry === 'rental' && (
                        <>
                            <button onClick={() => setInput("Ver disponibilidad de fechas")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase text-rose-400 hover:bg-rose-500/20 transition-all">
                                <Calendar size={14} /> Calendario
                            </button>
                            <button onClick={() => setInput("Reglas de la casa")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase text-rose-400 hover:bg-rose-500/20 transition-all">
                                <Info size={14} /> Reglas y Guía
                            </button>
                        </>
                    )}
                    {businessInfo.industry === 'legal' && (
                        <>
                            <button onClick={() => setInput("Consulta de honorarios")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase text-blue-400 hover:bg-blue-500/20 transition-all">
                                <Gavel size={14} /> Consultar Tarifas
                            </button>
                            <button onClick={() => setInput("Subir documento para revisión")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase text-blue-400 hover:bg-blue-500/20 transition-all">
                                <Zap size={14} /> Enviar Documento
                            </button>
                        </>
                    )}
                    {businessInfo.industry === 'consulting' && (
                        <>
                            <button onClick={() => setInput("Agendar sesión de diagnóstico")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                <Briefcase size={14} /> Sesión Gratis
                            </button>
                            <button onClick={() => setInput("Ver servicios de consultoría")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                <Star size={14} /> Servicios
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#0f1115] via-[#0f1115] to-transparent sticky bottom-0 z-50">
                <div className="max-w-3xl mx-auto relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe tu mensaje aquí..."
                        className="w-full bg-[#1e2126]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] py-5 pl-8 pr-16 outline-none focus:border-indigo-500/50 transition-all shadow-2xl placeholder:text-slate-500 font-medium"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="mt-4 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                    Powered by NexoBot Intelligent Systems
                </p>
            </div>
        </div>
    );
}
