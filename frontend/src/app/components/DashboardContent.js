import React from 'react';
import {
    Calendar, FileText, Users, PieChart, ChevronLeft, ChevronRight,
    Plus, Zap, Clock, ExternalLink, User, Bot, Share2, MessageSquare
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';

const DashboardContent = ({
    activeTab,
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
}) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    let tabLabel = "";
    let actionLabel = "";
    let actionType = "";

    if (activeTab === 'main') {
        tabLabel = currentIndustry.labels.main;
        actionLabel = currentIndustry.labels.action;
        actionType = 'Cita';
    } else if (activeTab === 'billing_or_docs') {
        tabLabel = businessConfig.industry === 'legal' || businessConfig.industry === 'consulting' ? t.documents : t.billing;
        actionLabel = lang === 'en' ? `New Item` : `Nueva ${tabLabel}`;
        actionType = 'Factura';
    } else if (activeTab === 'items') {
        tabLabel = currentIndustry.labels.items;
        actionLabel = lang === 'en' ? `New ${tabLabel}` : `Nuevo ${tabLabel}`;
        actionType = 'Cliente';
    } else if (activeTab === 'inventory') {
        tabLabel = lang === 'es' ? 'Inventario & Productos' : 'Inventory & Products';
        actionLabel = lang === 'es' ? 'Nuevo Producto' : 'New Product';
        actionType = 'Inventario';
    } else if (activeTab === 'inbox') {
        tabLabel = lang === 'es' ? 'Inbox IA' : 'AI Inbox';
    } else if (activeTab === 'finances') {
        tabLabel = t.finances;
    } else if (activeTab === 'marketing') {
        tabLabel = t.marketing;
    }

    return (
        <div className="grid grid-cols-1 gap-8">
            {activeTab !== 'marketing' && (
                <section className="dashboard-card p-6">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex gap-1">
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronLeft size={18} /></button>
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronRight size={18} /></button>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold">
                                {lang === 'es' ? `Gestión de ${tabLabel}` : `${tabLabel} Management`}
                            </h3>
                        </div>
                        {actionLabel && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleQuickAction(actionType)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Plus size={16} /> {actionLabel}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative min-h-[400px]">
                        {businessConfig.isLocked && activeTab !== 'marketing' && (
                            <div className="absolute inset-0 z-50 backdrop-blur-md bg-[#0f1115]/60 flex flex-col items-center justify-center rounded-3xl p-8 text-center border border-white/10 shadow-2xl">
                                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/40 animate-bounce">
                                    <Zap size={40} className="text-white fill-white" />
                                </div>
                                <h4 className="text-2xl font-bold mb-3">{t.trial_active}</h4>
                                <p className="text-slate-400 max-w-sm mb-8">
                                    Activa tu acceso total a NexoBot hoy. Disfruta de **3 días de prueba gratuita** con todas las funciones de {tabLabel} activadas.
                                </p>
                                <button
                                    onClick={handleSubscription}
                                    disabled={isSubscribing}
                                    className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isSubscribing ? '🚀 Conectando con Stripe...' : '🚀 Empezar prueba de 3 días gratis'}
                                </button>
                                <p className="mt-4 text-[10px] text-slate-500 uppercase font-bold tracking-widest">No se cobrará nada durante los primeros 3 días</p>
                            </div>
                        )}

                        <div className="pt-6">
                            {activeTab === 'main' && (
                                <div className="space-y-6">
                                    {/* IA PROACTIVE INSIGHTS CARD */}
                                    <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 rounded-[2rem] p-6 border border-indigo-500/30 relative overflow-hidden group">
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40 shrink-0">
                                                    <Bot size={28} className="text-white animate-pulse" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold mb-1">NexoBot Insights IA</h4>
                                                    <p className="text-xs text-indigo-300 font-medium uppercase tracking-widest mb-3">Análisis en tiempo real • {isMounted ? new Date().toLocaleDateString() : '...'}</p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Zap size={14} className="text-yellow-400" />
                                                            <span><strong className="text-white">Oportunidad:</strong> Detectamos 5 clientes que no han vuelto en 30 días.</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Users size={14} className="text-cyan-400" />
                                                            <span><strong className="text-white">Sentimiento:</strong> El 95% de tus clientes están satisfechos esta semana.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {dashboardData.bookings.length === 0 ? (
                                            <div className="text-center py-20 bg-white/[0.02] rounded-2xl">
                                                <Calendar size={48} className="mx-auto mb-4 text-slate-600" />
                                                <p className="text-slate-400">No hay citas agendadas aún.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                {dashboardData.bookings.map((booking) => (
                                                    <div key={booking.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.07] transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                                                                <Calendar size={24} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{booking.property_name}</h4>
                                                                <p className="text-xs text-slate-400 flex items-center gap-2">
                                                                    <Clock size={12} /> {isMounted ? `${new Date(booking.start_date).toLocaleDateString()} ${new Date(booking.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '...'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                                {booking.status}
                                                            </span>
                                                            <p className="text-sm font-bold mt-1">${booking.total_price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'billing_or_docs' && (
                                <div className="space-y-4">
                                    {dashboardData.transactions.filter(t => t.invoice_url || !t.is_income).length === 0 ? (
                                        <div className="text-center py-20 bg-white/[0.02] rounded-2xl">
                                            <FileText size={48} className="mx-auto mb-4 text-slate-600" />
                                            <p className="text-slate-400">No hay facturas o documentos generados.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-separate border-spacing-y-2">
                                                <thead>
                                                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        <th className="px-4 py-2">Documento / Concepto</th>
                                                        <th className="px-4 py-2">Fecha</th>
                                                        <th className="px-4 py-2 text-right">Monto</th>
                                                        <th className="px-4 py-2 text-right">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dashboardData.transactions.map((tx) => (
                                                        <tr key={tx.id} className="bg-white/5 hover:bg-white/[0.08] transition-all">
                                                            <td className="px-4 py-4 rounded-l-2xl border-l border-t border-b border-white/5">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText size={18} className="text-indigo-400" />
                                                                    <span className="font-bold text-sm">{tx.description}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 border-t border-b border-white/5 text-xs text-slate-400">
                                                                {new Date(tx.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-4 border-t border-b border-white/5 text-right font-bold text-sm">
                                                                <span className={tx.is_income ? 'text-green-400' : 'text-red-400'}>
                                                                    {tx.is_income ? '+' : '-'}${tx.amount}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 rounded-r-2xl border-r border-t border-b border-white/5 text-right">
                                                                <button className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20"><ExternalLink size={14} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'items' && (
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-2">Mis Clientes</h4>
                                        {dashboardData.customers.length === 0 ? (
                                            <div className="p-20 border border-white/5 border-dashed rounded-3xl text-center text-slate-500 text-sm">
                                                <Users size={40} className="mx-auto mb-4 opacity-20" />
                                                Aquí aparecerán los clientes registrados por NexoBot automáticamente.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {dashboardData.customers.map((cust) => (
                                                    <div key={cust.id} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                                                        <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-600/10">
                                                            <User size={24} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-white mb-0.5">{cust.full_name}</p>
                                                            <p className="text-[10px] text-indigo-400 font-mono">{cust.phone}</p>
                                                        </div>
                                                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inbox' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                                    <div className="lg:col-span-1 bg-white/5 rounded-3xl border border-white/5 overflow-y-auto">
                                        <h4 className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Conversaciones NexoBot</h4>
                                        {dashboardData.messages.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-xs italic">Aún no hay interacciones.</div>
                                        ) : (
                                            dashboardData.messages.slice(0, 10).map((chat, idx) => (
                                                <div key={idx} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-sm">{chat.customer_name || 'Anónimo'}</span>
                                                        <span className="text-[9px] text-slate-500">{new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 truncate mb-2">{chat.content}</p>
                                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${chat.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                                        {chat.role === 'user' ? 'Cliente' : 'NexoBot Assistant'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="lg:col-span-2 bg-[#0f1115]/40 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <MessageSquare size={32} className="text-slate-600" />
                                        </div>
                                        <h4 className="font-bold mb-2">Monitor de Chat Inteligente</h4>
                                        <p className="text-xs text-slate-400 max-w-xs">
                                            Aquí verás lo que tus clientes hablan con NexoBot. La IA responde automáticamente.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finances' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl">
                                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Ingresos Totales</p>
                                            <h4 className="text-2xl font-bold">${dashboardData.transactions.filter(t => t.is_income).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</h4>
                                        </div>
                                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Gastos / Comisiones</p>
                                            <h4 className="text-2xl font-bold">${dashboardData.transactions.filter(t => !t.is_income).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</h4>
                                        </div>
                                        <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl">
                                            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Balance Neto</p>
                                            <h4 className="text-2xl font-bold">
                                                ${(dashboardData.transactions.filter(t => t.is_income).reduce((acc, t) => acc + t.amount, 0) -
                                                    dashboardData.transactions.filter(t => !t.is_income).reduce((acc, t) => acc + t.amount, 0)).toFixed(2)}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 h-[350px]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <PieChart size={16} className="text-cyan-400" />
                                                Crecimiento de Ingresos
                                            </h4>
                                            <button
                                                onClick={() => handleQuickAction('Memoria')}
                                                className="px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-600/20 transition-all flex items-center gap-2"
                                            >
                                                <FileText size={12} /> Descargar Reporte PDF
                                            </button>
                                        </div>
                                        <div className="w-full h-[200px]">
                                            {isMounted && (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={
                                                        dashboardData.transactions.reduce((acc, tx) => {
                                                            const date = new Date(tx.created_at);
                                                            const month = date.toLocaleDateString(lang, { month: 'short' });
                                                            const existing = acc.find(d => d.name === month);
                                                            if (existing) {
                                                                existing.amount += tx.is_income ? tx.amount : -tx.amount;
                                                            } else {
                                                                acc.push({ name: month, amount: tx.is_income ? tx.amount : -tx.amount });
                                                            }
                                                            return acc;
                                                        }, []).slice(-6)
                                                    }>
                                                        <defs>
                                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                                        />
                                                        <YAxis hide />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#181a1f', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                                            itemStyle={{ color: '#fff', fontSize: '10px' }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="amount"
                                                            stroke="#6366f1"
                                                            strokeWidth={3}
                                                            fillOpacity={1}
                                                            fill="url(#colorAmount)"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inventory' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl">
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Productos/Servicios</p>
                                            <h4 className="text-2xl font-bold">{businessConfig.services.length}</h4>
                                        </div>
                                        <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl">
                                            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Stock Bajo Alertas</p>
                                            <h4 className="text-2xl font-bold">{businessConfig.services.filter(s => parseInt(s.stock || 0) <= 3).length}</h4>
                                        </div>
                                        <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl">
                                            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Valor Estimado</p>
                                            <h4 className="text-2xl font-bold">${businessConfig.services.reduce((acc, s) => acc + (parseFloat(s.price || 0) * parseInt(s.stock || 0)), 0).toFixed(2)}</h4>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5">
                                                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <th className="px-6 py-4">Producto / Servicio</th>
                                                    <th className="px-6 py-4">Precio</th>
                                                    <th className="px-6 py-4">Stock</th>
                                                    <th className="px-6 py-4 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {businessConfig.services.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic text-sm">
                                                            No hay productos configurados. Ve a "Mi Negocio" para añadirlos.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    businessConfig.services.map((svc, idx) => (
                                                        <tr key={idx} className="hover:bg-white/[0.02] transition-all">
                                                            <td className="px-6 py-4">
                                                                <span className="font-bold text-sm text-white">{svc.name}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-indigo-400 font-bold">${svc.price}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${parseInt(svc.stock || 0) <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                                    {svc.stock} unidades
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button onClick={() => handleQuickAction('Inventario')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-all">
                                                                    <ExternalLink size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-2">
                                <Bot size={14} className="text-cyan-400" />
                                Dile a <span className="text-white font-bold">NexoBot</span> en el chat que gestione elementos para ti.
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'marketing' && (
                <section className="dashboard-card p-10 bg-gradient-to-br from-[#181a1f] to-[#121418] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-2 tracking-tight">🚀 Modo Viral: Tu NexoBot en el Mundo</h3>
                        <p className="text-slate-400 mb-10 max-w-xl">Publica tu asistente en Instagram, Facebook o WhatsApp y deja que trabaje por ti 24/7 vendiendo.</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="bg-[#0f1115] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 block">Tu Enlace de Ventas Personalizado</label>
                                    <div className="flex gap-3">
                                        <input
                                            readOnly
                                            value={`${typeof window !== 'undefined' ? window.location.origin : 'https://nexobot-ai.onrender.com'}/public/${user?.tenant_id || 'demo'}`}
                                            className="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl text-xs font-mono outline-none text-indigo-200"
                                        />
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/public/${user?.tenant_id || 'demo'}`;
                                                navigator.clipboard.writeText(link);
                                                alert(lang === 'es' ? '¡Enlace copiado!' : 'Link copied!');
                                            }}
                                            className="px-6 py-4 bg-indigo-600 rounded-2xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                        >
                                            {lang === 'es' ? 'Copiar' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-5">
                                    <button onClick={() => handleSocialShare('whatsapp')} className="py-6 bg-[#25D366]/5 border border-[#25D366]/10 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-[#25D366]/10 transition-all active:scale-95 group">
                                        <Share2 className="text-[#25D366] group-hover:scale-110 transition-transform" size={28} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">WhatsApp</span>
                                    </button>
                                    <button onClick={() => handleSocialShare('facebook')} className="py-6 bg-[#1877F2]/5 border border-[#1877F2]/10 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-[#1877F2]/10 transition-all active:scale-95 group">
                                        <Share2 className="text-[#1877F2] group-hover:scale-110 transition-transform" size={28} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Facebook</span>
                                    </button>
                                    <button onClick={() => handleSocialShare('instagram')} className="py-6 bg-[#E1306C]/5 border border-[#E1306C]/10 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-[#E1306C]/10 transition-all active:scale-95 group">
                                        <Share2 className="text-[#E1306C] group-hover:scale-110 transition-transform" size={28} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Instagram</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/5 p-8 md:p-10 rounded-[3rem] border border-white/10 flex flex-col items-center justify-center text-center backdrop-blur-xl relative group">
                                <div className="absolute inset-0 bg-green-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <div className="w-48 h-48 bg-white p-4 rounded-[2.5rem] mb-6 shadow-2xl shadow-green-500/20 flex items-center justify-center transition-all hover:scale-105 duration-500">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`https://wa.me/${businessConfig.whatsapp_phone || businessConfig.phone}?text=Hola, quiero información!`)}`}
                                            alt="WhatsApp Direct QR"
                                            className="w-full h-full"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 p-3 rounded-2xl shadow-xl text-white">
                                        <Phone size={20} />
                                    </div>
                                </div>

                                <h4 className="font-bold text-lg mb-2">Mi WhatsApp Directo</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-6">Escanea para enviarme un mensaje directo</p>

                                <div className="flex gap-2 w-full max-w-xs">
                                    <button
                                        onClick={() => window.open(`https://wa.me/${businessConfig.whatsapp_phone || businessConfig.phone}`, '_blank')}
                                        className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-bold uppercase transition-all shadow-lg shadow-green-600/20"
                                    >
                                        Probar Enlace WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default DashboardContent;
