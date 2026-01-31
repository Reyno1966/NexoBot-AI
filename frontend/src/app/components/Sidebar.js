import React from 'react';
import {
    Calendar, FileText, Users, PieChart, Bell, ChevronDown,
    Share2, LogIn, ExternalLink, Copy, Bot, X, Menu, Settings, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    lang,
    setLang,
    t,
    businessConfig,
    user,
    onlineCount,
    userCount,
    isLangMenuOpen,
    setIsLangMenuOpen,
    handleLogout,
    handleSubscription,
    isSubscribing,
    currentIndustry,
    industries,
    isSettingsOpen,
    setIsSettingsOpen
}) => {
    return (
        <>
            {/* Sidebar Backdrop (Mobile Only) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Mobile Overlay & Desktop Sidebar) */}
            <aside className={`
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                fixed md:relative inset-y-0 left-0 z-[70] 
                w-72 md:w-64 bg-[#181a1f] border-r border-white/5 
                flex flex-col p-6 transition-transform duration-300 ease-in-out
                md:flex md:static overflow-y-auto scrollbar-hide
            `}>
                <div className="flex items-center justify-between mb-8 px-2 lg:px-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-cyan-500/20 bg-white/5">
                            <img src={businessConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-base md:text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400 leading-none">NexoBot</h1>
                            <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t.tagline}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Community Snapshot */}
                <div className="mb-8 px-2">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-1.5">
                            {[11, 12, 13].map((i) => (
                                <img key={i} src={`https://i.pravatar.cc/100?u=user${i}`} className="w-5 h-5 rounded-full border border-[#181a1f]" alt="U" />
                            ))}
                        </div>
                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-tight flex items-center gap-1">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            {onlineCount} {lang === 'es' ? 'en línea' : 'online'}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-tight">
                        {t.social_proof.joined.replace('{count}', userCount.toLocaleString())}
                    </p>
                </div>

                <div className="hidden md:block bg-[#1e2126] rounded-2xl p-4 border border-white/5 space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Bot size={18} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{t.public_link}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{t.public_link_desc}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.open(`/public/${user?.tenant_id}`, '_blank')}
                            className="flex-1 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={14} /> {t.view}
                        </button>
                        <button
                            onClick={() => {
                                const link = `${window.location.origin}/public/${user?.tenant_id}`;
                                navigator.clipboard.writeText(link);
                                alert(t.copied);
                            }}
                            className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all border border-white/5"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        {
                            id: 'main',
                            name: currentIndustry.labels.main,
                            icon: Calendar
                        },
                        {
                            id: 'billing_or_docs',
                            name: businessConfig.industry === 'legal' || businessConfig.industry === 'consulting' ? t.documents : t.billing,
                            icon: FileText
                        },
                        {
                            id: 'items',
                            name: currentIndustry.labels.items,
                            icon: Users
                        },
                        {
                            id: 'inbox',
                            name: lang === 'es' ? 'Inbox IA' : 'AI Inbox',
                            icon: MessageSquare
                        },
                        { id: 'finances', name: t.finances, icon: PieChart },
                        { id: 'marketing', name: t.marketing, icon: Share2 },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                            }}
                            className={`sidebar-item w-full ${activeTab === item.id ? 'sidebar-item-active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className={`sidebar-item w-full ${isSettingsOpen ? 'sidebar-item-active' : ''}`}
                    >
                        <Settings size={20} />
                        <span className="font-medium">{t.my_business}</span>
                    </button>

                    {/* Selector de Idioma */}
                    <div className="relative pt-4">
                        <button
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="sidebar-item w-full flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Share2 size={20} className="text-slate-400 group-hover:text-cyan-400" />
                                <span className="font-medium">Idioma: <span className="uppercase text-cyan-400">{lang}</span></span>
                            </div>
                            <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isLangMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 mt-2 bg-[#1e2126] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                                >
                                    {[
                                        { id: 'es', name: 'Español' },
                                        { id: 'en', name: 'English' },
                                        { id: 'de', name: 'Deutsch' },
                                        { id: 'it', name: 'Italiano' },
                                        { id: 'fr', name: 'Français' },
                                        { id: 'pt', name: 'Português' }
                                    ].map((l) => (
                                        <button
                                            key={l.id}
                                            onClick={() => {
                                                setLang(l.id);
                                                setIsLangMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors ${lang === l.id ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-400'}`}
                                        >
                                            {l.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                <div className="mt-8 space-y-4">
                    <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl p-4 border border-cyan-500/20">
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">{t.trial_active}</p>
                        <p className="text-[10px] font-medium text-slate-300 mb-3 leading-relaxed">
                            {t.subscribe_desc}
                            <br />
                            {lang === 'es' ? `El abono de $9.99/mes iniciará automáticamente.` : `A monthly fee of $9.99/month will start automatically.`}
                        </p>
                        <button
                            onClick={handleSubscription}
                            disabled={isSubscribing}
                            className={`w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 ${isSubscribing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubscribing ? (lang === 'en' ? 'Connecting...' : 'Conectando...') : t.subscribe}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors px-2 w-full text-left"
                    >
                        <LogIn size={20} className="rotate-180" />
                        <span className="text-sm font-medium">{t.logout}</span>
                    </button>
                    {/* Padding bottom for mobile safely */}
                    <div className="h-20 md:hidden" />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
