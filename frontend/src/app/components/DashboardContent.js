import React, { useState, useEffect } from 'react';
import {
    Share2, Bot, Globe, Smartphone, Phone, Facebook, Instagram, Copy, Zap,
    ExternalLink, QrCode, Calendar, Clock, Users, PieChart, FileText,
    MessageSquare, ChevronLeft, ChevronRight, Plus, User, Star
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function DashboardContent({
    activeTab,
    setActiveTab,
    currentIndustry,
    businessConfig,
    dashboardData,
    t,
    lang,
    handleQuickAction,
    handleSubscription,
    isSubscribing,
    mockFinancialData,
    handleSocialShare,
    user,
    setBusinessConfig,
    handleSaveBusinessConfig
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="p-8 text-slate-500 animate-pulse">Cargando experiencia NexoBot...</div>;

    // Helper para determinar etiquetas dinámicas
    let tabLabel = "";
    let actionLabel = "";
    let actionType = "";

    if (activeTab === 'main') {
        tabLabel = currentIndustry?.labels?.main || 'Agenda';
        actionLabel = currentIndustry?.labels?.action || 'Nueva Cita';
        actionType = 'Cita';
    } else if (activeTab === 'billing_or_docs') {
        tabLabel = businessConfig?.industry === 'legal' || businessConfig?.industry === 'consulting' ? (t?.documents || 'Documentos') : (t?.billing || 'Facturación');
        actionLabel = lang === 'en' ? `New Item` : `Nueva ${tabLabel}`;
        actionType = 'Factura';
    } else if (activeTab === 'items') {
        tabLabel = currentIndustry?.labels?.items || 'Servicios';
        actionLabel = lang === 'en' ? `New ${tabLabel}` : `Nuevo ${tabLabel}`;
        actionType = 'Cliente';
    } else if (activeTab === 'inbox') {
        tabLabel = lang === 'es' ? 'Inbox IA (Beta)' : 'AI Inbox (Beta)';
    } else if (activeTab === 'finances') {
        tabLabel = t?.finances || 'Finanzas';
    } else if (activeTab === 'marketing') {
        tabLabel = t?.marketing || 'Marketing';
    }

    // RENDERIZADO DE PANTALLA DE MARKETING (Premium V6.0 Integrated)
    if (activeTab === 'marketing') {
        const tenantId = user?.tenant_id || 'demo';
        const publicLink = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/public/${tenantId}` : '';
        const qrContent = publicLink;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{tabLabel}</h2>
                        <p className="text-slate-400 font-medium">Potencia tu negocio con inteligencia artificial.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20 uppercase">Core V6.0 Live</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 group bg-[#181a1f]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all duration-500">
                        <div className="flex items-start justify-between mb-8">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                                <Bot size={32} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enlace del Chat</span>
                                <h3 className="text-white font-bold">Tu Asistente Online</h3>
                            </div>
                        </div>

                        <div className="relative group/input mb-6">
                            <div className="absolute inset-0 bg-indigo-500/5 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                            <div className="relative bg-black/40 border border-white/5 rounded-3xl p-6 font-mono text-sm text-indigo-300 break-all select-all">
                                {publicLink}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(publicLink);
                                    alert("¡Enlace copiado con éxito!");
                                }}
                                className="flex-1 min-w-[140px] py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Copy size={16} /> Copiar Link
                            </button>
                            <button
                                onClick={() => window.open(publicLink, '_blank')}
                                className="flex-1 min-w-[140px] py-4 bg-white/5 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={16} /> Probar Chat
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl shadow-indigo-500/10">
                        <div className="bg-black/5 p-4 rounded-3xl mb-4 border border-black/5">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrContent)}`}
                                alt="QR Code"
                                className="w-40 h-40 mix-blend-multiply"
                            />
                        </div>
                        <h4 className="text-black font-black text-lg tracking-tight uppercase">Código QR</h4>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Escanea para agendar</p>
                        <button
                            className="w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-95 transition-all outline-none"
                            onClick={() => window.print()}
                        >
                            Imprimir QR
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => handleSocialShare('whatsapp')} className="group flex items-center gap-4 p-6 bg-[#25d366]/10 border border-[#25d366]/20 rounded-3xl hover:bg-[#25d366]/20 transition-all">
                        <div className="p-3 bg-[#25d366] text-white rounded-xl shadow-lg shadow-[#25d366]/30"><Smartphone size={24} /></div>
                        <div className="text-left"><p className="text-[10px] text-[#25d366] font-black uppercase">WhatsApp</p><p className="text-white font-bold">Compartir</p></div>
                    </button>
                    <button onClick={() => handleSocialShare('facebook')} className="group flex items-center gap-4 p-6 bg-[#1877f2]/10 border border-[#1877f2]/20 rounded-3xl hover:bg-[#1877f2]/20 transition-all">
                        <div className="p-3 bg-[#1877f2] text-white rounded-xl shadow-lg shadow-[#1877f2]/30"><Facebook size={24} /></div>
                        <div className="text-left"><p className="text-[10px] text-[#1877f2] font-black uppercase">Facebook</p><p className="text-white font-bold">Compartir</p></div>
                    </button>
                    <button onClick={() => handleSocialShare('instagram')} className="group flex items-center gap-4 p-6 bg-[#e4405f]/10 border border-[#e4405f]/20 rounded-3xl hover:bg-[#e4405f]/20 transition-all">
                        <div className="p-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-xl shadow-lg shadow-[#e4405f]/30"><Instagram size={24} /></div>
                        <div className="text-left"><p className="text-[10px] text-[#e4405f] font-black uppercase">Instagram</p><p className="text-white font-bold">Compartir</p></div>
                    </button>
                </div>
            </div>
        );
    }

    // RENDERIZADO GENERAL PARA OTROS TABS
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[600px]">
            {/* Header de Sección */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-500 transition-all"><ChevronLeft size={18} /></button>
                        <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-white transition-all"><ChevronRight size={18} /></button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">{tabLabel}</h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Panel de Control Inteligente</p>
                    </div>
                </div>
                {actionLabel && (
                    <button
                        onClick={() => handleQuickAction(actionType)}
                        className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Plus size={18} /> {actionLabel}
                    </button>
                )}
            </div>

            <div className="relative">
                {/* Lógica de Bloqueo por Prueba (Excepto Marketing) */}
                {businessConfig?.isLocked && (
                    <div className="absolute inset-x-0 -top-4 -bottom-4 z-[100] backdrop-blur-md bg-[#0f1115]/60 flex flex-col items-center justify-center rounded-[3rem] p-8 text-center border border-white/10 shadow-2xl">
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/40 animate-bounce">
                            <Zap size={48} className="text-white fill-white" />
                        </div>
                        <h4 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">{t?.trial_active || 'PRUEBA ACTIVA'}</h4>
                        <p className="text-slate-400 max-w-sm mb-10 font-medium leading-relaxed">
                            Activa tu acceso total a NexoBot hoy. Disfruta de <span className="text-white font-bold">3 días de prueba gratuita</span> con todas las funciones de {tabLabel} activadas.
                        </p>
                        <button
                            onClick={handleSubscription}
                            disabled={isSubscribing}
                            className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSubscribing ? '🚀 Conectando...' : '🚀 Empieza tu prueba ahora'}
                        </button>
                        <p className="mt-6 text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Suscripción mensual de $9.99 después de la prueba</p>
                    </div>
                )}

                {/* CONTENIDO ESPECÍFICO DE CADA TAB */}
                <div className="pt-4">
                    {/* TAB AGENDA (MAIN) */}
                    {activeTab === 'main' && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 rounded-[2.5rem] p-8 border border-indigo-500/30 relative overflow-hidden group">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-start gap-6">
                                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 shrink-0">
                                            <Bot size={40} className="text-white animate-pulse" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white tracking-tighter uppercase mb-1">NexoBot Insights IA</h4>
                                            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-4">Análisis Predictivo • {new Date().toLocaleDateString()}</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm font-medium">
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                                    <span><strong className="text-white uppercase text-[10px]">Oportunidad:</strong> Detectamos 5 clientes que no han vuelto en 30 días.</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-medium">
                                                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                                                    <span><strong className="text-white uppercase text-[10px]">Sentimiento:</strong> El 95% de tus clientes están "Muy Satisfechos" esta semana.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl border-none">
                                        Ejecutar Estrategia IA
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {(!dashboardData?.bookings || dashboardData.bookings.length === 0) ? (
                                    <div className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                                        <Calendar size={64} className="mx-auto mb-6 text-slate-700" />
                                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No hay citas agendadas para hoy</p>
                                    </div>
                                ) : (
                                    dashboardData.bookings.map((booking) => (
                                        <div key={booking.id} className="group p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between backdrop-blur-sm">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <Calendar size={28} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white">{booking.property_name}</h4>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                                                        <Clock size={14} className="text-indigo-500" /> {new Date(booking.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(booking.start_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                                    {booking.status}
                                                </span>
                                                <p className="text-xl font-black text-white mt-2">${booking.total_price}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB FINANZAS */}
                    {activeTab === 'finances' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Ingresos Brutos', val: dashboardData?.transactions?.filter(t => t.is_income).reduce((acc, t) => acc + t.amount, 0) || 0, color: 'text-green-400', bg: 'bg-green-400/10' },
                                    { label: 'Gastos y Costos', val: dashboardData?.transactions?.filter(t => !t.is_income).reduce((acc, t) => acc + t.amount, 0) || 0, color: 'text-red-400', bg: 'bg-red-400/10' },
                                    { label: 'Utilidad Neta', val: (dashboardData?.transactions?.filter(t => t.is_income).reduce((acc, t) => acc + t.amount, 0) || 0) - (dashboardData?.transactions?.filter(t => !t.is_income).reduce((acc, t) => acc + t.amount, 0) || 0), color: 'text-cyan-400', bg: 'bg-cyan-400/10' }
                                ].map((stat, i) => (
                                    <div key={i} className={`p-8 rounded-[2.5rem] border border-white/5 ${stat.bg} backdrop-blur-xl`}>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                        <h4 className={`text-4xl font-black ${stat.color} tracking-tighter`}>${stat.val.toFixed(2)}</h4>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[#181a1f]/40 p-8 rounded-[3rem] border border-white/5 h-[400px]">
                                <h4 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                                    <PieChart size={20} className="text-cyan-400" /> Rendimiento de Caja
                                </h4>
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={
                                            dashboardData?.transactions?.reduce((acc, tx) => {
                                                const date = new Date(tx.created_at);
                                                const month = date.toLocaleDateString(lang, { month: 'short' });
                                                const existing = acc.find(d => d.name === month);
                                                if (existing) existing.amount += tx.is_income ? tx.amount : -tx.amount;
                                                else acc.push({ name: month, amount: tx.is_income ? tx.amount : -tx.amount });
                                                return acc;
                                            }, []).slice(-6) || []
                                        }>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis hide />
                                            <Tooltip contentStyle={{ backgroundColor: '#181a1f', border: '1px solid #ffffff10', borderRadius: '16px', fontWeight: 'bold' }} />
                                            <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fill="url(#colorAmount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB SERVICIOS / CLIENTES */}
                    {activeTab === 'items' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[#181a1f]/40 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Nuevos Clientes</h4>
                                {(!dashboardData?.customers || dashboardData.customers.length === 0) ? (
                                    <div className="py-20 text-center text-slate-600 font-bold uppercase text-[10px]">Sin actividad reciente</div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData.customers.map((cust) => (
                                            <div key={cust.id} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                                <div className="w-12 h-12 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400 font-black">{cust.full_name[0]}</div>
                                                <div><p className="font-bold text-white">{cust.full_name}</p><p className="text-[10px] text-slate-500 uppercase font-black">{cust.phone}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="bg-[#181a1f]/40 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Catálogo Pro</h4>
                                <div className="space-y-4">
                                    {(!businessConfig?.services || businessConfig.services.length === 0) ? (
                                        <p className="text-xs text-slate-600 italic py-10 text-center">Configura servicios para verlos aquí</p>
                                    ) : (
                                        businessConfig.services.map((svc, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all">
                                                <div className="flex items-center gap-3"><Star size={16} className="text-orange-500" /><span className="font-bold text-white">{svc.name}</span></div>
                                                <span className="text-lg font-black text-orange-400">${svc.price}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB INBOX IA */}
                    {activeTab === 'inbox' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
                                <h4 className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Monitor de Conversaciones</h4>
                                <div className="divide-y divide-white/5">
                                    {[
                                        { name: "Juan Pérez", status: "IA Atendiendo", color: "text-green-400" },
                                        { name: "Sra. García", status: "Acción Requerida", color: "text-orange-400" },
                                        { name: "Carlos Ruiz", status: "Cita Confirmada", color: "text-cyan-400" }
                                    ].map((chat, idx) => (
                                        <div key={idx} className="p-6 hover:bg-white/[0.03] cursor-pointer transition-all">
                                            <div className="flex justify-between mb-1"><span className="font-black text-white">{chat.name}</span><span className="text-[8px] text-slate-500 uppercase font-black">Justo ahora</span></div>
                                            <span className={`text-[9px] font-black uppercase ${chat.color}`}>{chat.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-indigo-600/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                                    <MessageSquare size={44} className="text-slate-700" />
                                </div>
                                <h4 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Sala de Control IA</h4>
                                <p className="text-xs text-slate-500 max-w-sm mb-10 font-bold uppercase tracking-widest">Observa cómo NexoBot trabaja en tiempo real para cerrar ventas y agendar citas por ti.</p>
                                <button className="px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all border-none">Activar Interceptor</button>
                            </div>
                        </div>
                    )}

                    {/* TAB INVENTARIO */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-orange-500/10 rounded-[2.5rem] border border-orange-500/20">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Artículos en Stock</p>
                                    <h4 className="text-4xl font-black text-white tracking-tighter">{businessConfig?.services?.length || 0} Categorías</h4>
                                </div>
                                <div className="p-8 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Valor Total Estimado</p>
                                    <h4 className="text-4xl font-black text-white tracking-tighter">${(businessConfig?.services?.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0) || 0).toFixed(2)}</h4>
                                </div>
                            </div>
                            <div className="bg-[#181a1f]/40 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Detalle de Inventario</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {(!businessConfig?.services || businessConfig.services.length === 0) ? (
                                        <div className="py-20 text-center text-slate-600 font-bold uppercase text-[10px]">No hay productos registrados</div>
                                    ) : (
                                        businessConfig.services.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400"><PieChart size={20} /></div>
                                                    <div><p className="font-bold text-white">{item.name}</p><p className="text-[10px] text-slate-500 uppercase font-black">Stock disponible</p></div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-white">${item.price}</p>
                                                    <span className="text-[10px] font-black text-green-500 uppercase">Activo</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB FACTURACIÓN / DOCS */}
                    {activeTab === 'billing_or_docs' && (
                        <div className="bg-[#181a1f]/40 p-8 rounded-[2.5rem] border border-white/5">
                            {(!dashboardData?.transactions || dashboardData.transactions.length === 0) ? (
                                <div className="py-32 text-center"><FileText size={64} className="mx-auto mb-6 text-slate-800" /><p className="text-slate-600 font-bold uppercase text-[10px]">Sin movimientos registrados</p></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-3">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                <th className="px-6 py-4">Descripción</th>
                                                <th className="px-6 py-4">Fecha</th>
                                                <th className="px-6 py-4 text-right">Monto</th>
                                                <th className="px-6 py-4 text-right">Detalles</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.transactions.map((tx) => (
                                                <tr key={tx.id} className="bg-white/5 rounded-2xl group transition-all hover:bg-white/[0.07]">
                                                    <td className="px-6 py-5 rounded-l-2xl border-l border-t border-b border-white/5"><div className="flex items-center gap-3"><FileText size={18} className="text-indigo-400" /><span className="font-bold text-white">{tx.description}</span></div></td>
                                                    <td className="px-6 py-5 border-t border-b border-white/5 text-[10px] text-slate-500 font-black uppercase">{new Date(tx.created_at).toLocaleDateString()}</td>
                                                    <td className={`px-6 py-5 border-t border-b border-white/5 text-right font-black ${tx.is_income ? 'text-green-400' : 'text-red-400'}`}>{tx.is_income ? '+' : '-'}${tx.amount}</td>
                                                    <td className="px-6 py-5 rounded-r-2xl border-r border-t border-b border-white/5 text-right"><button className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><ExternalLink size={16} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB SUSCRIPCIÓN (BILLING) */}
                    {activeTab === 'billing' && (
                        <div className="max-w-2xl mx-auto space-y-8 py-8">
                            <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 p-10 rounded-[3rem] text-center shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={120} className="text-white fill-white" /></div>
                                <div className="relative z-10">
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/30">Plan Inteligente</span>
                                    <h4 className="text-5xl font-black text-white tracking-tighter mt-6 mb-2">NexoBot Pro</h4>
                                    <p className="text-white/80 font-bold uppercase text-xs tracking-widest mb-10">Todo lo que necesitas para escalar</p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <button onClick={handleSubscription} className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl">Gestionar Suscripción</button>
                                        <button className="w-full sm:w-auto px-10 py-5 bg-black/20 text-white font-black uppercase text-xs tracking-widest rounded-2xl border border-white/10 hover:bg-black/30 transition-all">Ver Facturas</button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Próximo Pago</p>
                                    <p className="text-xl font-black text-white">{new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()}</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Monto Incurrido</p>
                                    <p className="text-xl font-black text-white">$9.99 USD</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer de Ayuda IA */}
            <div className="mt-12 py-8 border-t border-white/5 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"><Bot size={20} className="text-indigo-400" /></div>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">NexoBot Core Engine V6.0 Safe Mode</p>
                <p className="text-xs text-slate-400 max-w-md font-medium">Usa el chat de la derecha para pedirle a NexoBot que cree nuevas citas, servicios o analice tus finanzas automáticamente.</p>
            </div>
        </div>
    );
}
