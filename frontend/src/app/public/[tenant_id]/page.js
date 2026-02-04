"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, ChevronRight, Smartphone, MapPin, Globe, Scissors, Stethoscope, Gavel, Home, Hotel, Briefcase, Calendar, Clock, Star, Zap, Info, Mic, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicChat({ params }) {
    const { tenant_id } = React.use(params);

    // Helper para parseo seguro
    const safeParse = (str, fallback) => {
        try {
            if (!str || str === 'null') return fallback;
            if (typeof str !== 'string') return str;
            const parsed = JSON.parse(str);
            return parsed || fallback;
        } catch (e) {
            return fallback;
        }
    };
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [error, setError] = useState(null);

    const handleClearMessages = () => {
        if (messages.length > 0 && window.confirm('¿Quieres limpiar la conversación?')) {
            setMessages([]);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Navegador no compatible.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => setInput(prev => prev + ' ' + e.results[0][0].transcript);
        recognition.start();
    };
    const [businessInfo, setBusinessInfo] = useState({
        name: 'Cargando...',
        industry: 'general',
        logoUrl: '/logo.jpg',
        phone: '',
        address: '',
        services: [],
        businessHours: {}
    });
    const scrollRef = useRef(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Cargar datos públicos del negocio
        const fetchBusiness = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
                const response = await fetch(`${apiUrl}/api/v1/auth/public/tenant/${tenant_id}`);
                const data = await response.json();
                if (response.ok) {
                    setBusinessInfo({
                        name: data.name,
                        industry: data.industry,
                        logoUrl: data.logo_url || '/logo.jpg',
                        phone: data.phone || '',
                        address: data.address || '',
                        services: safeParse(data.services, []),
                        businessHours: safeParse(data.business_hours, {}),
                        stripePublicKey: data.stripe_public_key || null
                    });
                } else {
                    setError("No pudimos encontrar este negocio. Verifica que el enlace sea correcto.");
                }
            } catch (error) {
                console.error("Error al cargar negocio:", error);
                setError("Error de conexión con el servidor.");
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

    const handleSend = async (overrideInput = null) => {
        const messageText = overrideInput || input;
        if (!messageText.trim() || isLoading) return;

        const userMsg = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
            const response = await fetch(`${apiUrl}/api/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    tenant_id: tenant_id,
                    industry_override: businessInfo.industry
                })
            });
            const data = await response.json();

            const assistantMsg = {
                role: 'assistant',
                text: data.response,
                intent: data.intent,
                metadata: data.metadata
            };

            // Mostrar el formulario solo si el intent es de recolección y NO es ya una confirmación final
            const isConfirmation = messageText.includes("Confirmo mi cita");
            if ((data.intent === 'book_appointment' || data.intent === 'collect_data') && !isConfirmation) {
                // Verificar si faltan datos críticos antes de mostrar el formulario
                const hasCriticalData = data.metadata?.cliente && data.metadata?.telefono && data.metadata?.fecha;
                if (!hasCriticalData) {
                    assistantMsg.showForm = true;
                }
            }

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Lo siento, tuve un problema al conectar. ¿Podrías reintentar?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) return <div className="min-h-screen bg-[#0f1115]" />;

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 text-center">
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <Info className="text-red-500 w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold">¡Ups! Algo salió mal</h1>
                    <p className="text-slate-400 max-w-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-xl font-bold tracking-tight">{businessInfo?.name || 'Negocio'}</h1>
                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            {lang === 'en' ? 'Virtual Assistant Active' : 'Asistente Virtual Activo'}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsInfoModalOpen(true)} className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-all flex items-center gap-2 px-3">
                        <Info size={20} />
                        <span className="text-[10px] font-bold uppercase hidden sm:inline">Info</span>
                    </button>
                    <button onClick={handleClearMessages} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-red-400 transition-all">
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>

            {/* Information Modal */}
            <AnimatePresence>
                {isInfoModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsInfoModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg max-h-[85vh] overflow-y-auto bg-[#181a1f] p-6 rounded-3xl border border-white/10 shadow-2xl z-[70]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Información del Negocio</h3>
                                <button onClick={() => setIsInfoModalOpen(false)} className="p-2 text-slate-400 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Services Section */}
                                {businessInfo.services.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">Nuestros Servicios y Productos</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {businessInfo?.services?.map((svc, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{svc?.name}</p>
                                                        {svc?.stock !== '0' && <p className="text-[10px] text-slate-500">Stock disponible: {svc?.stock}</p>}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="text-indigo-400 font-bold">${svc?.price}</span>
                                                        {businessInfo?.stripePublicKey && (
                                                            <button
                                                                onClick={() => alert(`Iniciando pago de ${svc?.name} por $${svc?.price}... (Función en desarrollo)`)}
                                                                className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-[8px] font-bold uppercase hover:bg-green-500/30 transition-all"
                                                            >
                                                                💳 Pagar Ahora
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Business Hours Section */}
                                {Object.keys(businessInfo.businessHours).length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border-b border-white/5 pb-2">Horarios de Atención</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {Object.entries(businessInfo.businessHours).map(([day, config]) => (
                                                config.enabled && (
                                                    <div key={day} className="flex justify-between items-center text-xs">
                                                        <span className="text-slate-400 uppercase font-medium">{day}</span>
                                                        <span className="text-white font-bold">{config.open} - {config.close}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Details */}
                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    {businessInfo.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Smartphone size={16} className="text-indigo-400" />
                                            <span>{businessInfo.phone}</span>
                                        </div>
                                    )}
                                    {businessInfo.address && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin size={16} className="text-indigo-400" />
                                            <span>{businessInfo.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
                                {(msg.text || "").split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
                                    part && part.match(/^https?:\/\//) ? (
                                        <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="block mt-3 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-center shadow-lg transition-all">
                                            📥 Ver Documento
                                        </a>
                                    ) : part
                                )}
                            </p>
                            {msg.showForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3"
                                >
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                        <Calendar size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Confirmar Datos de la Cita</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <input type="text" placeholder="Nombre completo" defaultValue={msg.metadata?.cliente || ''} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" id={`name-${i}`} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Teléfono" defaultValue={msg.metadata?.telefono || ''} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" id={`phone-${i}`} />
                                            <input type="text" placeholder="Fecha/Hora" defaultValue={msg.metadata?.fecha ? `${msg.metadata.fecha} ${msg.metadata.hora || ''}` : ''} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" id={`date-${i}`} />
                                        </div>
                                        <input type="text" placeholder="Dirección completa" defaultValue={msg.metadata?.direccion || ''} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" id={`address-${i}`} />
                                        <button onClick={() => {
                                            const n = document.getElementById(`name-${i}`).value;
                                            const p = document.getElementById(`phone-${i}`).value;
                                            const d = document.getElementById(`date-${i}`).value;
                                            const a = document.getElementById(`address-${i}`).value;
                                            handleSend(`Confirmo mi cita. Nombre: ${n}, Teléfono: ${p}, Fecha: ${d}, Dirección: ${a}`);
                                        }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs">Confirmar y Registrar Cita</button>
                                    </div>
                                </motion.div>
                            )}
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
                    {(!businessInfo.industry || businessInfo.industry === 'general') && (
                        <>
                            <button onClick={() => handleSend("Agendar una cita")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                <Calendar size={14} /> Agendar Cita
                            </button>
                            <button onClick={() => handleSend("Ver servicios y precios")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                <Star size={14} /> Servicios
                            </button>
                            <button onClick={() => handleSend("Horarios de atención")} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                <Clock size={14} /> Horarios
                            </button>
                        </>
                    )}
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
                    <button
                        onClick={startListening}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-slate-400 hover:text-indigo-400'}`}
                    >
                        <Mic size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje aquí..."}
                        className="w-full bg-[#1e2126]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] py-5 pl-14 pr-16 outline-none focus:border-indigo-500/50 transition-all shadow-2xl placeholder:text-slate-500 font-medium"
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
