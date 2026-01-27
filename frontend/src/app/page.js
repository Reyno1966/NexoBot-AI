"use client";
// Vercel Deployment Trigger: 2026-01-20
import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { translations } from './i18n';
import {
    Calendar,
    FileText,
    Users,
    PieChart,
    Bell,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Plus,
    MessageSquare,
    Bot,
    MoreHorizontal,
    Settings,
    Scissors,
    Stethoscope,
    Gavel,
    Home,
    Briefcase,
    Hotel,
    Key,
    Share2,
    LogIn,
    ExternalLink,
    Copy,
    Check,
    Trash2,
    Menu,
    X,
    Mic,
    Send,
    Clock,
    User,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Industry Presets con Configuración de Transformación Automática
// Industry Presets - UI and Logic settings
const industryPresets = [
    { id: 'barber', icon: Scissors, color: 'text-orange-400', price: 9.99 },
    { id: 'health', icon: Stethoscope, color: 'text-teal-400', price: 19.99 },
    { id: 'legal', icon: Gavel, color: 'text-blue-400', price: 29.99 },
    { id: 'realestate', icon: Home, color: 'text-emerald-400', price: 24.99 },
    { id: 'rental', icon: Hotel, color: 'text-rose-400', price: 19.99 },
    { id: 'consulting', icon: Briefcase, color: 'text-indigo-400', price: 29.99 },
];

// Mock data for the chart based on image
const mockFinancialData = [
    { name: 'Sun', value: 35000 },
    { name: 'Mon', value: 45000 },
    { name: 'Tue', value: 85000 },
    { name: 'Wed', value: 65000 },
    { name: 'Thu', value: 95000 },
    { name: 'Fri', value: 75000 },
    { name: 'Sat', value: 110000 },
    { name: 'Sun', value: 90000 },
];

// Helper para parseo seguro
const safeParse = (str, fallback) => {
    try {
        if (!str) return fallback;
        if (typeof str !== 'string') return str;
        return JSON.parse(str);
    } catch (e) {
        console.warn("Error parsing JSON, using fallback", e);
        return fallback;
    }
};


export default function NexoBotDashboard() {
    const [activeTab, setActiveTab] = useState('main');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [lang, setLang] = useState('es');
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const t = translations[lang] || translations['es'];

    // Data for Dashboard
    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        customers: [],
        transactions: [],
        isLoaded: false
    });

    // Simulation for Social Proof
    const [userCount, setUserCount] = useState(12430);
    const [onlineCount, setOnlineCount] = useState(842);

    useEffect(() => {
        const interval = setInterval(() => {
            setUserCount(prev => prev + Math.floor(Math.random() * 2));
            setOnlineCount(prev => prev + (Math.floor(Math.random() * 5) - 2));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Industries Dinámicas basadas en el Idioma
    const industries = industryPresets.map(preset => ({
        ...preset,
        name: t.industries[preset.id].name,
        labels: t.industries[preset.id].labels
    }));

    // Revisar si ya hay sesión al cargar
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
            setIsAuthenticated(true);
            loadUserData(savedToken);
        }
    }, []);

    // Detectar éxito de Stripe y refrescar datos
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('session_id')) {
            window.history.replaceState({}, document.title, window.location.pathname);
            if (token) loadUserData(token);
        }
    }, [token]);

    const loadUserData = async (authToken) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
            const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
                headers: { 'token': authToken }
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data);
                if (data.tenant) {
                    setBusinessConfig({
                        name: data.tenant.name,
                        industry: data.tenant.industry,
                        phone: data.tenant.phone || '',
                        address: data.tenant.address || '',
                        country: data.tenant.country || '',
                        logoUrl: data.tenant.logo_url || '/logo.jpg',
                        mainInterest: data.tenant.main_interest,
                        isLocked: data.tenant.is_locked,
                        currency: data.tenant.currency || 'USD',
                        stripe_customer_id: data.tenant.stripe_customer_id,
                        stripe_public_key: data.tenant.stripe_public_key || '',
                        stripe_secret_key: data.tenant.stripe_secret_key || '',
                        services: safeParse(data.tenant.services, []),
                        businessHours: {
                            monday: { open: '09:00', close: '18:00', enabled: true },
                            tuesday: { open: '09:00', close: '18:00', enabled: true },
                            wednesday: { open: '09:00', close: '18:00', enabled: true },
                            thursday: { open: '09:00', close: '18:00', enabled: true },
                            friday: { open: '09:00', close: '18:00', enabled: true },
                            saturday: { open: '09:00', close: '14:00', enabled: false },
                            sunday: { open: '09:00', close: '14:00', enabled: false },
                            ...safeParse(data.tenant.business_hours, {})
                        },
                        whatsappNotificationsEnabled: data.tenant.whatsapp_notifications_enabled || false
                    });

                    // Transformación automática de la UI basada en el Objetivo/Interés
                    const interest = data.tenant.main_interest;
                    if (interest === 'Facturas' || interest === 'Documents') {
                        setActiveTab('billing_or_docs');
                    } else if (interest === 'Marketing') {
                        setActiveTab('marketing');
                    } else if (interest === 'Finanzas') {
                        setActiveTab('finances');
                    } else {
                        setActiveTab('main');
                    }
                }
            }
        } catch (error) {
            console.error("Error cargando usuario:", error);
        }
    };

    const loadDashboardData = async (authToken) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
            const headers = { 'token': authToken, 'Content-Type': 'application/json' };

            const [bookingsRes, customersRes, transactionsRes] = await Promise.all([
                fetch(`${apiUrl}/api/v1/data/bookings`, { headers }),
                fetch(`${apiUrl}/api/v1/data/customers`, { headers }),
                fetch(`${apiUrl}/api/v1/data/transactions`, { headers })
            ]);

            const [bookings, customers, transactions] = await Promise.all([
                bookingsRes.json(),
                customersRes.json(),
                transactionsRes.json()
            ]);

            setDashboardData({
                bookings: Array.isArray(bookings) ? bookings : [],
                customers: Array.isArray(customers) ? customers : [],
                transactions: Array.isArray(transactions) ? transactions : [],
                isLoaded: true
            });
        } catch (error) {
            console.error("Error cargando datos del dashboard:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated && token) {
            loadDashboardData(token);
        }
    }, [isAuthenticated, token, activeTab]);

    const handleAuthSuccess = (newToken) => {
        setToken(newToken);
        setIsAuthenticated(true);
        loadUserData(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setToken(null);
    };

    const handleSocialShare = (platform) => {
        const shareLink = `${window.location.origin}/public/${user?.tenant_id || 'demo'}`;
        const text = lang === 'es'
            ? `¡Hola! Mira el asistente inteligente de ${businessConfig.name} para agendar citas y comprar online: ${shareLink}`
            : `Hi! Check out ${businessConfig.name}'s new AI assistant for bookings and orders: ${shareLink}`;

        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank');
        } else if (platform === 'instagram') {
            navigator.clipboard.writeText(shareLink);
            alert(lang === 'es'
                ? '¡Link copiado! Pégalo en tu biografía de Instagram para que tus clientes te encuentren.'
                : 'Link copied! Paste it into your Instagram bio so your customers can find you.');
            window.open('https://instagram.com', '_blank');
        }
    };

    const handleQuickAction = (action) => {
        setIsChatOpen(true);
        let prompt = '';
        if (action === 'Factura') {
            prompt = lang === 'es'
                ? 'Hola NexoBot, quiero crear una nueva factura. ¿Qué datos necesitas?'
                : 'Hi NexoBot, I want to create a new invoice. What details do you need?';
        }
        if (action === 'Cita') {
            prompt = lang === 'es'
                ? 'Hola, necesito agendar una nueva cita en el calendario.'
                : 'Hi, I need to schedule a new appointment in the calendar.';
        }
        if (action === 'Memoria') {
            prompt = lang === 'es'
                ? 'NexoBot, genera una memoria de actividad de mi negocio en PDF por favor.'
                : 'NexoBot, please generate an activity report for my business in PDF.';
        }
        if (action === 'Cliente') {
            prompt = lang === 'es'
                ? 'Quiero registrar un nuevo cliente en el sistema.'
                : 'I want to register a new client in the system.';
        }

        setInput(prompt);
    };

    // Chat State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const handleClearMessages = () => {
        if (messages.length > 0 && window.confirm(t.confirm_delete)) {
            setMessages([]);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Tu navegador no soporta el reconocimiento de voz. Intenta con Chrome o Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'es' ? 'es-ES' : (lang === 'en' ? 'en-US' : lang);
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            setInput(transcript); // Reemplazamos el texto para mayor claridad en dictados cortos
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const [businessConfig, setBusinessConfig] = useState({
        name: 'Tu Negocio Inteligente',
        industry: 'barber',
        logoUrl: '/logo.jpg',
        isLocked: false,
        phone: '',
        address: '',
        country: '',
        currency: 'USD',
        mainInterest: 'Citas',
        stripe_customer_id: null,
        stripe_public_key: '',
        stripe_secret_key: '',
        services: [],
        businessHours: {
            monday: { open: '09:00', close: '18:00', enabled: true },
            tuesday: { open: '09:00', close: '18:00', enabled: true },
            wednesday: { open: '09:00', close: '18:00', enabled: true },
            thursday: { open: '09:00', close: '18:00', enabled: true },
            friday: { open: '09:00', close: '18:00', enabled: true },
            saturday: { open: '09:00', close: '14:00', enabled: false },
            sunday: { open: '09:00', close: '14:00', enabled: false },
        },
        whatsappNotificationsEnabled: false
    });

    const handleSaveBusinessConfig = async (configOverride = null) => {
        setIsLoading(true);
        const configToSave = configOverride || businessConfig;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
            const response = await fetch(`${apiUrl}/api/v1/auth/tenant`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify({
                    name: configToSave.name,
                    industry: configToSave.industry,
                    phone: configToSave.phone,
                    address: configToSave.address,
                    country: configToSave.country,
                    logo_url: configToSave.logoUrl,
                    main_interest: configToSave.mainInterest,
                    stripe_public_key: configToSave.stripe_public_key,
                    stripe_secret_key: configToSave.stripe_secret_key,
                    services: JSON.stringify(configToSave.services),
                    business_hours: JSON.stringify(configToSave.businessHours),
                    whatsapp_notifications_enabled: configToSave.whatsappNotificationsEnabled
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (!configOverride) alert(t.save_success);
                setIsSettingsOpen(false);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.detail || t.save_error}`);
            }
        } catch (error) {
            console.error('Error guardando configuración:', error);
            alert('Error de conexión al guardar.');
        } finally {
            setIsLoading(false);
        }
    };

    const currentIndustry = industries.find(i => i.id === businessConfig.industry) || industries[0];

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
            const response = await fetch(`${apiUrl}/api/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    tenant_id: user?.tenant_id || '',
                    industry_override: businessConfig.industry,
                    language: lang
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            setMessages(prev => [...prev, { role: 'assistant', text: 'Ups, tuve un problema de conexión. ¿Podrías intentar de nuevo?' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscription = async () => {
        if (!user?.tenant_id) {
            alert('Error: No se encontró la información de tu negocio. Intenta cerrar sesión y volver a entrar.');
            return;
        }

        setIsSubscribing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
            const price = currentIndustry.price || 19.99;

            console.log("Solicitando checkout para:", user.tenant_id, "precio:", price);

            const response = await fetch(`${apiUrl}/api/v1/payments/create-checkout-session?tenant_id=${user.tenant_id}&amount=${price}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok && data.url) {
                window.location.href = data.url; // Redirigir a Stripe
            } else {
                console.error("Error de Stripe:", data);
                alert(`Error: ${data.detail || 'No se pudo crear la sesión de pago'}`);
            }
        } catch (error) {
            console.error('Error al iniciar pago:', error);
            alert('No se pudo conectar con el servidor de pagos. Verifica tu conexión.');
        } finally {
            setIsSubscribing(false);
        }
    };

    if (!isAuthenticated) {
        return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }

    return (
        <div className="min-h-screen bg-[#0f1115] text-white font-sans overflow-x-hidden md:flex">
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
                            {lang === 'es' ? `El abono de $${currentIndustry.price}/mes iniciará automáticamente.` : `A monthly fee of $${currentIndustry.price} will start automatically.`}
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

            {/* Main Content */}
            <main className="flex-1 w-full md:w-auto min-h-screen bg-[#0f1115] overflow-y-auto">
                <div data-version="v3-final-mobile" className="md:hidden flex items-center justify-between p-4 bg-[#181a1f] border-b border-white/5 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white">
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5">
                                <img src={businessConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-sm tracking-tight text-gradient-premium">NexoBot</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(`/public/${user?.tenant_id}`, '_blank')}
                            className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center"
                            title="Ver como cliente"
                        >
                            <ExternalLink size={18} />
                        </button>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {/* MOBILE QUICK ACCESS: Canal Público - Always on top for mobile */}
                    <div className="md:hidden mb-6 bg-gradient-to-r from-indigo-900/40 to-indigo-800/20 rounded-[2rem] p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                <Bot size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Canal Público</h2>
                                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Tu IA lista para clientes</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">Comparte este enlace con tus clientes para que agenden citas o hagan consultas automáticamente.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open(`/public/${user?.tenant_id}`, '_blank')}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                            >
                                <ExternalLink size={16} /> Ver Vista Cliente
                            </button>
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/public/${user?.tenant_id}`;
                                    navigator.clipboard.writeText(link);
                                    alert('Link copiado al portapapeles');
                                }}
                                className="p-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl transition-all border border-white/10 active:scale-95"
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>
                    <header className="hidden md:flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 bg-white/5 rounded-2xl ${currentIndustry.color} shadow-lg shadow-black/20`}>
                                <currentIndustry.icon size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{businessConfig.name}</h1>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">{currentIndustry.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <Search size={20} />
                            </button>
                            <div className="relative">
                                <button className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                    <Bell size={20} />
                                </button>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-[#0f1115]">
                                    3
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white/5 shadow-xl">
                                <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Dynamic Section Header */}
                        {(() => {
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
                            } else if (activeTab === 'finances') {
                                tabLabel = t.finances;
                            } else if (activeTab === 'marketing') {
                                tabLabel = t.marketing;
                            }

                            return (
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

                                    <div className="relative">
                                        {businessConfig.isLocked && activeTab !== 'marketing' && (
                                            <div className="absolute inset-0 z-50 backdrop-blur-md bg-[#0f1115]/60 flex flex-col items-center justify-center rounded-3xl p-8 text-center border border-white/10 shadow-2xl">
                                                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/40 animate-bounce">
                                                    <Zap size={40} className="text-white fill-white" />
                                                </div>
                                                <h4 className="text-2xl font-bold mb-3">{t.trial_active}</h4>
                                                <p className="text-slate-400 max-w-sm mb-8">
                                                    Activa tu acceso total a NexoBot hoy. Disfruta de **7 días de prueba gratuita** con todas las funciones de {tabLabel} activadas.
                                                </p>
                                                <button
                                                    onClick={handleSubscription}
                                                    disabled={isSubscribing}
                                                    className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
                                                >
                                                    {isSubscribing ? '🚀 Conectando con Stripe...' : '🚀 Empezar prueba de 7 días gratis'}
                                                </button>
                                                <p className="mt-4 text-[10px] text-slate-500 uppercase font-bold tracking-widest">No se cobrará nada durante los primeros 7 días</p>
                                            </div>
                                        )}

                                        <div className="pt-6">
                                            {activeTab === 'main' && (
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
                                                                                <Clock size={12} /> {new Date(booking.start_date).toLocaleDateString()} {new Date(booking.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-2">Mis Clientes Recientes</h4>
                                                        {dashboardData.customers.length === 0 ? (
                                                            <div className="p-10 border border-white/5 border-dashed rounded-2xl text-center text-slate-500 text-sm">
                                                                Aquí aparecerán los clientes registrados por NexoBot.
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {dashboardData.customers.map((cust) => (
                                                                    <div key={cust.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                                        <div className="w-10 h-10 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400">
                                                                            <User size={20} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold">{cust.full_name}</p>
                                                                            <p className="text-[10px] text-slate-500">{cust.phone}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest pl-2">Catálogo de Servicios</h4>
                                                        <div className="space-y-3">
                                                            {businessConfig.services.length === 0 ? (
                                                                <p className="text-xs text-slate-500 italic">No tienes servicios configurados.</p>
                                                            ) : (
                                                                businessConfig.services.map((svc, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                                                        <span className="text-sm font-bold">{svc.name}</span>
                                                                        <span className="text-sm text-orange-400 font-bold">${svc.price}</span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
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

                                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                        <h4 className="text-sm font-bold mb-4">Flujo de Caja Reciente</h4>
                                                        {dashboardData.transactions.length === 0 ? (
                                                            <p className="text-xs text-slate-500 italic text-center py-10">No hay transacciones registradas.</p>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {dashboardData.transactions.slice(0, 5).map((tx) => (
                                                                    <div key={tx.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                                                        <span className="text-slate-300">{tx.description}</span>
                                                                        <span className={tx.is_income ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                                                            {tx.is_income ? '+' : '-'}${tx.amount}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-2">
                                                <Bot size={14} className="text-cyan-400" />
                                                Dile a <span className="text-white font-bold">NexoBot</span> en el chat que gestione nuevos elementos para este panel.
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            );
                        })()}

                        {/* Financial Summary */}
                        <section className="dashboard-card p-6">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-bold">Rendimiento Financiero</h3>
                                <button
                                    onClick={() => handleQuickAction('Memoria')}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                                >
                                    <FileText size={14} /> Generar Memoria PDF
                                </button>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockFinancialData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e2126', border: 'none', borderRadius: '12px' }} />
                                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {activeTab === 'marketing' && (
                            <section className="dashboard-card p-8 bg-gradient-to-br from-[#181a1f] to-[#121418] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-2">🚀 Modo Viral: Tu Asistente en Redes</h3>
                                    <p className="text-slate-400 mb-8 max-w-xl">Publica a NexoBot en Instagram, Facebook o WhatsApp y deja que trabaje por ti 24/7 atendiendo clientes.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="bg-[#0f1115] p-6 rounded-[2rem] border border-white/5">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Tu Enlace Público de Ventas</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        readOnly
                                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/public/${user?.tenant_id || 'demo'}`}
                                                        className="flex-1 bg-white/5 border border-white/5 p-3 rounded-xl text-xs font-mono outline-none"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const link = `${window.location.origin}/public/${user?.tenant_id}`;
                                                            navigator.clipboard.writeText(link);
                                                            alert('Link copiado');
                                                        }}
                                                        className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all"
                                                    >
                                                        Copiar
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => handleSocialShare('whatsapp')}
                                                    className="py-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-[#25D366]/20 transition-all active:scale-95"
                                                >
                                                    <MessageSquare className="text-[#25D366]" size={24} />
                                                    <span className="text-[10px] font-bold uppercase">WhatsApp</span>
                                                </button>
                                                <button
                                                    onClick={() => handleSocialShare('facebook')}
                                                    className="py-4 bg-[#1877F2]/10 border border-[#1877F2]/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-[#1877F2]/20 transition-all active:scale-95"
                                                >
                                                    <Share2 className="text-[#1877F2]" size={20} />
                                                    <span className="text-[10px] font-bold uppercase">Facebook</span>
                                                </button>
                                                <button
                                                    onClick={() => handleSocialShare('instagram')}
                                                    className="py-4 bg-[#E1306C]/10 border border-[#E1306C]/20 rounded-2xl flex flex-col items-center gap-2 hover:bg-[#E1306C]/20 transition-all active:scale-95"
                                                >
                                                    <Share2 className="text-[#E1306C]" size={20} />
                                                    <span className="text-[10px] font-bold uppercase">Instagram</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center text-center">
                                            <div className="w-40 h-40 bg-white p-3 rounded-3xl mb-4 shadow-2xl shadow-white/5">
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin + '/public/' + (user?.tenant_id || 'demo')) : ''}`} alt="QR Code" className="w-full h-full" />
                                            </div>
                                            <p className="font-bold mb-1">Tu Código QR de Negocio</p>
                                            <p className="text-xs text-slate-500">Imprímelo para tu local o ponlo en tus historias.</p>
                                        </div>
                                    </div>

                                    <div className="mt-12 bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem]">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                                <Bell size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold">Alertas Inteligentes en tu Celular</h4>
                                                <p className="text-slate-400 text-sm">Cada vez que un cliente hable con tu NexoBot, te avisaremos al instante por WhatsApp.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newConfig = { ...businessConfig, whatsappNotificationsEnabled: !businessConfig.whatsappNotificationsEnabled };
                                                    setBusinessConfig(newConfig);
                                                    handleSaveBusinessConfig(newConfig);
                                                }}
                                                className="ml-auto flex items-center gap-3 bg-[#0f1115] p-2 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all group"
                                            >
                                                <span className={`pl-4 text-sm font-bold uppercase tracking-widest transition-colors ${businessConfig.whatsappNotificationsEnabled ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                    {businessConfig.whatsappNotificationsEnabled ? 'Activo' : 'Inactivo'}
                                                </span>
                                                <div className={`w-12 h-6 rounded-full relative transition-colors ${businessConfig.whatsappNotificationsEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${businessConfig.whatsappNotificationsEnabled ? 'right-1' : 'left-1'}`} />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* SETTINGS MODAL - Business Personalization */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSettingsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto bg-[#181a1f] p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl z-[110]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl md:text-2xl font-bold">Transforma tu Negocio</h3>
                                <button onClick={() => setIsSettingsOpen(false)} className="md:hidden p-2 text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nombre de la Empresa</label>
                                    <input
                                        type="text"
                                        value={businessConfig.name}
                                        onChange={(e) => setBusinessConfig({ ...businessConfig, name: e.target.value })}
                                        className="w-full bg-[#0f1115] border border-white/5 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold"
                                        placeholder="Ej: Clínica Dental Smile"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">{t.business_logo}</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-[#0f1115] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                                            <img src={businessConfig.logoUrl} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <input
                                                type="text"
                                                value={businessConfig.logoUrl === '/logo.jpg' ? '' : businessConfig.logoUrl}
                                                placeholder={lang === 'es' ? "URL del logo o sube uno..." : "Logo URL or upload one..."}
                                                onChange={(e) => setBusinessConfig({ ...businessConfig, logoUrl: e.target.value })}
                                                className="w-full bg-[#0f1115] border border-white/5 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all text-xs font-mono"
                                            />
                                            <div className="flex gap-2">
                                                <label className="flex-1 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-600/20 transition-all text-center cursor-pointer">
                                                    📤 {lang === 'es' ? 'Subir Logo' : 'Upload Logo'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setBusinessConfig({ ...businessConfig, logoUrl: reader.result });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                {businessConfig.logoUrl !== '/logo.jpg' && (
                                                    <button
                                                        onClick={() => setBusinessConfig({ ...businessConfig, logoUrl: '/logo.jpg' })}
                                                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase hover:bg-red-500/20 transition-all"
                                                    >
                                                        {lang === 'es' ? 'Reset' : 'Reset'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                                        ¿A qué te dedicas?
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {industries.map((ind) => (
                                            <button
                                                key={ind.id}
                                                onClick={() => setBusinessConfig({ ...businessConfig, industry: ind.id })}
                                                className={`p-3 md:p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${businessConfig.industry === ind.id ? 'bg-indigo-600 border-indigo-400' : 'bg-[#0f1115] border-white/5 text-slate-400'}`}
                                            >
                                                <ind.icon size={20} />
                                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tight text-center">{ind.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block">{t.phone_label}</label>
                                        <input
                                            type="text"
                                            value={businessConfig.phone}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, phone: e.target.value })}
                                            className="w-full bg-[#0f1115] border border-white/5 p-3 rounded-xl outline-none focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block">{t.country_label}</label>
                                        <input
                                            type="text"
                                            value={businessConfig.country}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, country: e.target.value })}
                                            className="w-full bg-[#0f1115] border border-white/5 p-3 rounded-xl outline-none focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block">{t.address_label}</label>
                                        <input
                                            type="text"
                                            value={businessConfig.address}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, address: e.target.value })}
                                            className="w-full bg-[#0f1115] border border-white/5 p-3 rounded-xl outline-none focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Sección: Catálogo de Servicios / Productos */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-2 block">{lang === 'es' ? 'Servicios, Citas o Artículos' : 'Services, Appointments or Items'}</label>
                                        <button
                                            onClick={() => {
                                                const newServices = [...businessConfig.services, { name: '', price: '', stock: '0' }];
                                                setBusinessConfig({ ...businessConfig, services: newServices });
                                            }}
                                            className="text-[10px] bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full font-bold hover:bg-indigo-600/30 transition-all"
                                        >
                                            + {lang === 'es' ? 'Añadir Item' : 'Add Item'}
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                        {businessConfig.services.length === 0 && (
                                            <p className="text-[10px] text-slate-500 italic text-center py-2">{lang === 'es' ? 'No has definido servicios aún.' : 'No services defined yet.'}</p>
                                        )}
                                        {businessConfig.services.map((svc, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    placeholder={lang === 'es' ? "Nombre" : "Name"}
                                                    value={svc.name}
                                                    onChange={(e) => {
                                                        const newSvc = [...businessConfig.services];
                                                        newSvc[idx].name = e.target.value;
                                                        setBusinessConfig({ ...businessConfig, services: newSvc });
                                                    }}
                                                    className="flex-1 bg-[#0f1115] border border-white/5 p-2 rounded-lg text-xs outline-none focus:border-indigo-500"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder={lang === 'es' ? "Precio" : "Price"}
                                                    value={svc.price}
                                                    onChange={(e) => {
                                                        const newSvc = [...businessConfig.services];
                                                        newSvc[idx].price = e.target.value;
                                                        setBusinessConfig({ ...businessConfig, services: newSvc });
                                                    }}
                                                    className="w-20 bg-[#0f1115] border border-white/5 p-2 rounded-lg text-xs outline-none focus:border-indigo-500"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Stock"
                                                    value={svc.stock}
                                                    onChange={(e) => {
                                                        const newSvc = [...businessConfig.services];
                                                        newSvc[idx].stock = e.target.value;
                                                        setBusinessConfig({ ...businessConfig, services: newSvc });
                                                    }}
                                                    className="w-16 bg-[#0f1115] border border-white/5 p-2 rounded-lg text-xs outline-none focus:border-indigo-500"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newSvc = businessConfig.services.filter((_, i) => i !== idx);
                                                        setBusinessConfig({ ...businessConfig, services: newSvc });
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Nueva Sección: Horarios de Atención */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest ml-2 block border-b border-white/5 pb-2">Horarios de Atención Personal</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {Object.entries(businessConfig.businessHours).map(([day, config]) => (
                                            <div key={day} className="flex items-center justify-between bg-[#0f1115] p-2 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.enabled}
                                                        onChange={(e) => {
                                                            const newHours = { ...businessConfig.businessHours };
                                                            newHours[day].enabled = e.target.checked;
                                                            setBusinessConfig({ ...businessConfig, businessHours: newHours });
                                                        }}
                                                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                                                    />
                                                    <span className="text-xs font-bold uppercase w-20 text-slate-300">{t[day] || day}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="time"
                                                        value={config.open}
                                                        disabled={!config.enabled}
                                                        onChange={(e) => {
                                                            const newHours = { ...businessConfig.businessHours };
                                                            newHours[day].open = e.target.value;
                                                            setBusinessConfig({ ...businessConfig, businessHours: newHours });
                                                        }}
                                                        className="bg-white/5 border border-white/10 rounded-lg p-1 text-[10px] text-white outline-none focus:border-teal-500 disabled:opacity-30"
                                                    />
                                                    <span className="text-slate-500 text-[10px]">a</span>
                                                    <input
                                                        type="time"
                                                        value={config.close}
                                                        disabled={!config.enabled}
                                                        onChange={(e) => {
                                                            const newHours = { ...businessConfig.businessHours };
                                                            newHours[day].close = e.target.value;
                                                            setBusinessConfig({ ...businessConfig, businessHours: newHours });
                                                        }}
                                                        className="bg-white/5 border border-white/10 rounded-lg p-1 text-[10px] text-white outline-none focus:border-teal-500 disabled:opacity-30"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Nueva Sección: Pagos Privados (Pasarela Propia) */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-bold text-orange-400 uppercase tracking-widest ml-2 block">💸 Pasarela de Pagos Privada (Para cobrar a tus clientes)</label>
                                    <p className="text-[10px] text-slate-500 ml-2">Configura tus llaves de Stripe si deseas que tus clientes puedan pagarte directamente a través del asistente.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block">Stripe Public Key</label>
                                            <input
                                                type="text"
                                                value={businessConfig.stripe_public_key}
                                                onChange={(e) => setBusinessConfig({ ...businessConfig, stripe_public_key: e.target.value })}
                                                placeholder="pk_live_..."
                                                className="w-full bg-[#0f1115] border border-white/5 p-3 rounded-xl outline-none focus:border-orange-500 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block">Stripe Secret Key</label>
                                            <input
                                                type="password"
                                                value={businessConfig.stripe_secret_key}
                                                onChange={(e) => setBusinessConfig({ ...businessConfig, stripe_secret_key: e.target.value })}
                                                placeholder="sk_live_..."
                                                className="w-full bg-[#0f1115] border border-white/5 p-3 rounded-xl outline-none focus:border-orange-500 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {businessConfig.stripe_customer_id && (
                                    <div className="pt-2 border-t border-white/5">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://nexobot-ai.onrender.com');
                                                    const response = await fetch(`${apiUrl}/api/v1/payments/create-portal-session?tenant_id=${user.tenant_id}`, {
                                                        method: 'POST'
                                                    });
                                                    const data = await response.json();
                                                    if (data.url) window.location.href = data.url;
                                                } catch (err) {
                                                    alert(lang === 'es' ? "No se pudo abrir el portal." : "Could not open portal.");
                                                }
                                            }}
                                            className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-[10px] font-bold uppercase hover:bg-red-500/20 transition-all font-bold"
                                        >
                                            {lang === 'es' ? 'Gestionar o Cancelar Suscripción' : 'Manage or Cancel Subscription'}
                                        </button>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        onClick={handleSaveBusinessConfig}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {isLoading ? (lang === 'es' ? 'Guardando cambios...' : 'Saving changes...') : t.save_transform}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )
                }
            </AnimatePresence>

            {/* Floating Chat Button */}
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all z-50"
            >
                <MessageSquare className="text-white" size={28} />
            </button>

            {/* Chat Overlay */}
            <AnimatePresence>
                {isChatOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsChatOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className="fixed bottom-0 right-0 md:right-8 w-full md:w-[400px] h-[85vh] md:h-[650px] bg-[#181a1f] rounded-t-3xl border-x border-t border-white/10 shadow-2xl z-[70] overflow-hidden flex flex-col"
                        >
                            <div className="bg-indigo-600 p-4 md:p-6 flex justify-between items-center text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20 bg-white/5">
                                        <img src={businessConfig.logoUrl} alt="NexoBot" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">NexoBot Assistant</h4>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-bold text-white/70 uppercase">
                                                {t.mode_active.replace('{mode}', currentIndustry.name)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleClearMessages}
                                        className="p-2 text-white/60 hover:text-red-400 transition-colors"
                                        title="Borrar conversación"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white">
                                        <Plus className="rotate-45" size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#0f1115]/50 scroll-smooth">
                                {messages.length === 0 && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[85%]">
                                            <p className="text-sm">
                                                ¡Hola! 👋 Soy NexoBot, tu asistente inteligente.
                                                Te doy la bienvenida a tus <span className="text-cyan-400 font-bold">7 días de prueba gratuita</span>.
                                                ¿Cómo puedo ayudarte a potenciar tu negocio de <span className="text-indigo-400">{currentIndustry.name}</span> hoy?
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-white/5'}`}>
                                            {msg.role === 'user' ? <Users size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl max-w-[85%] border shadow-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600/20 border-indigo-500/30 rounded-tr-none text-white'
                                            : 'bg-white/5 border-white/5 rounded-tl-none text-slate-100'
                                            }`}>
                                            <p className="text-sm leading-relaxed">
                                                {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
                                                    part.match(/^https?:\/\//) ? (
                                                        <a
                                                            key={j}
                                                            href={part}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg"
                                                            onClick={(e) => {
                                                                console.log("Abriendo PDF:", part);
                                                            }}
                                                        >
                                                            📥 {lang === 'es' ? 'Descargar Documento' : 'Download Document'}
                                                        </a>
                                                    ) : part
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-[#181a1f] border-t border-white/5">
                                <div className="bg-[#0f1115] rounded-xl flex items-center p-2 border border-white/5 focus-within:border-indigo-500/50 transition-all">
                                    <button
                                        onClick={startListening}
                                        className={`p-2 rounded-lg transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-slate-400 hover:text-indigo-400'}`}
                                        title="Dictar mensaje"
                                    >
                                        <Mic size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={isListening ? t.listening : t.type_message}
                                        className="bg-transparent flex-1 px-4 py-2 text-sm outline-none"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || isLoading}
                                        className="bg-indigo-600 p-2 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
