"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
    Plus,
    MessageSquare,
    Bot,
    Settings,
    LogIn,
    ExternalLink,
    Copy,
    Menu,
    X,
    Mic,
    Send,
    User,
    Zap,
    Clock,
    Trash2,
    Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component Imports
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import AIChatAssistant from './components/AIChatAssistant';
import DashboardContent from './components/DashboardContent';

// Industry Presets
const industryPresets = [
    { id: 'barber', icon: Calendar, color: 'text-orange-400', price: 9.99 },
    { id: 'health', icon: Calendar, color: 'text-teal-400', price: 9.99 },
    { id: 'legal', icon: Calendar, color: 'text-blue-400', price: 9.99 },
    { id: 'realestate', icon: Calendar, color: 'text-emerald-400', price: 9.99 },
    { id: 'rental', icon: Calendar, color: 'text-rose-400', price: 9.99 },
    { id: 'consulting', icon: Calendar, color: 'text-indigo-400', price: 9.99 },
];

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

export default function NexoBotDashboard() {
    const [activeTab, setActiveTab] = useState('main');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [whatsappQr, setWhatsappQr] = useState(null);
    const [whatsappPairingCode, setWhatsappPairingCode] = useState(null);
    const [isGeneratingQr, setIsGeneratingQr] = useState(false);
    const [whatsappStatus, setWhatsappStatus] = useState('DISCONNECTED');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [lang, setLang] = useState('es');
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const t = translations[lang] || translations['es'];

    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        customers: [],
        transactions: [],
        messages: [],
        isLoaded: false
    });

    const [userCount, setUserCount] = useState(12430);
    const [onlineCount, setOnlineCount] = useState(842);
    const [isMounted, setIsMounted] = useState(false);

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
        whatsappNotificationsEnabled: false,
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        whatsapp_api_key: '',
        whatsapp_phone: '',
        whatsapp_instance_id: '',
        resend_api_key: '',
        google_calendar_token: '',
        primary_color: '#6366f1',
        secondary_color: '#22d3ee'
    });

    const industries = useMemo(() => {
        try {
            if (!t || !t.industries) return industryPresets;
            return industryPresets.map(preset => ({
                ...preset,
                name: t.industries[preset.id]?.name || preset.id,
                labels: t.industries[preset.id]?.labels || { main: 'Gestión', items: 'Items', clients: 'Clientes', action: 'Nuevo' }
            }));
        } catch (e) {
            console.error("Error generating industries", e);
            return industryPresets;
        }
    }, [t]);

    const currentIndustry = useMemo(() => {
        try {
            const industryId = businessConfig?.industry || 'barber';
            const found = (industries && industries.length > 0)
                ? (industries.find(i => i.id === industryId) || industries[0])
                : industryPresets[0];

            return {
                ...found,
                labels: found?.labels || { main: 'Gestión', items: 'Items', clients: 'Clientes', action: 'Nuevo' }
            };
        } catch (e) {
            return { id: 'barber', name: 'General', labels: { main: 'Gestión', items: 'Items', clients: 'Clientes', action: 'Nuevo' }, icon: Calendar, color: 'text-indigo-400' };
        }
    }, [industries, businessConfig?.industry]);

    useEffect(() => {
        let interval;
        if (isSettingsOpen && token) {
            // Verificación inicial de estatus
            const checkStatus = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
                    const response = await fetch(`${apiUrl}/api/v1/whatsapp/status`, { headers: { 'token': token } });
                    const data = await response.json();
                    if (data.status) setWhatsappStatus(data.status);

                    // Si no está conectado, intentamos cargar el QR automáticamente una vez
                    if (data.status !== 'CONNECTED' && !whatsappQr && !isGeneratingQr) {
                        handleGenerateQr();
                    }
                } catch (e) { console.error("Error polling status", e); }
            };
            checkStatus();
            interval = setInterval(checkStatus, 10000); // Cada 10 segs
        }
        return () => clearInterval(interval);
    }, [isSettingsOpen, token]);

    useEffect(() => {
        setIsMounted(true);
        const interval = setInterval(() => {
            setUserCount(prev => prev + Math.floor(Math.random() * 2));
            setOnlineCount(prev => prev + (Math.floor(Math.random() * 5) - 2));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async (authToken) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const headers = { 'token': authToken, 'Content-Type': 'application/json' };

            const [bookingsRes, customersRes, transactionsRes, messagesRes] = await Promise.all([
                fetch(`${apiUrl}/api/v1/data/bookings`, { headers }),
                fetch(`${apiUrl}/api/v1/data/customers`, { headers }),
                fetch(`${apiUrl}/api/v1/data/transactions`, { headers }),
                fetch(`${apiUrl}/api/v1/data/messages`, { headers })
            ]);

            const [bookings, customers, transactions, messages] = await Promise.all([
                bookingsRes.json(),
                customersRes.json(),
                transactionsRes.json(),
                messagesRes.json()
            ]);

            setDashboardData({
                bookings: Array.isArray(bookings) ? bookings : [],
                customers: Array.isArray(customers) ? customers : [],
                transactions: Array.isArray(transactions) ? transactions : [],
                messages: Array.isArray(messages) ? messages : [],
                isLoaded: true
            });
        } catch (error) {
            console.error("Error cargando datos del dashboard:", error);
        }
    };

    const loadUserData = async (authToken) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
                headers: { 'token': authToken || '' }
            });

            if (!response.ok) {
                console.warn("Sesión inválida o error de servidor, redirigiendo al login...");
                handleLogout();
                return;
            }

            const data = await response.json();
            setUser(data);
            if (data.tenant) {
                setBusinessConfig(prev => ({
                    ...prev,
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
                        ...prev.businessHours,
                        ...safeParse(data.tenant.business_hours, {})
                    },
                    whatsappNotificationsEnabled: data.tenant.whatsapp_notifications_enabled || false,
                    smtp_host: data.tenant.smtp_host || '',
                    smtp_port: data.tenant.smtp_port || 587,
                    smtp_user: data.tenant.smtp_user || '',
                    smtp_password: data.tenant.smtp_password || '',
                    resend_api_key: data.tenant.resend_api_key || '',
                    whatsapp_api_key: data.tenant.whatsapp_api_key || '',
                    whatsapp_phone: data.tenant.whatsapp_phone || '',
                    whatsapp_instance_id: data.tenant.whatsapp_instance_id || '',
                    google_calendar_token: data.tenant.google_calendar_token || '',
                    primary_color: data.tenant.primary_color || '#6366f1',
                    secondary_color: data.tenant.secondary_color || '#22d3ee'
                }));
            }
        } catch (error) {
            console.error("Error cargando usuario:", error);
            handleLogout();
        }
    };

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
            setIsAuthenticated(true);
            loadUserData(savedToken);
        }
    }, []);

    useEffect(() => {
        let interval;
        if (isAuthenticated && token) {
            loadDashboardData(token);
            interval = setInterval(() => {
                loadDashboardData(token);
            }, 20000); // Refrescar datos cada 20 segundos para ver nuevos mensajes/citas
        }
        return () => clearInterval(interval);
    }, [isAuthenticated, token]);

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
        try {
            if (typeof window === 'undefined') return;

            const tenantId = user?.tenant_id || 'demo';
            const bizName = businessConfig?.name || 'NexoBot';
            const shareLink = `${window.location.origin}/public/${tenantId}`;

            const text = lang === 'es'
                ? `¡Hola! Mira el asistente inteligente de ${bizName} para agendar citas y comprar online: ${shareLink}`
                : `Hi! Check out ${bizName}'s new AI assistant for bookings and orders: ${shareLink}`;

            if (platform === 'whatsapp') {
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            } else if (platform === 'facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank');
            } else if (platform === 'instagram') {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareLink).catch(err => console.error("Clipboard err", err));
                }
                alert(lang === 'es' ? '¡Link copiado! Pégalo en tu biografía o stories de Instagram.' : 'Link copied! Paste it in your Instagram bio or stories.');
                window.open('https://instagram.com', '_blank');
            }
        } catch (error) {
            console.error("Error in social share:", error);
        }
    };

    const handleQuickAction = (action) => {
        setIsChatOpen(true);
        let prompt = '';
        if (action === 'Factura') prompt = lang === 'es' ? 'Hola NexoBot, quiero crear una nueva factura.' : 'Hi NexoBot, I want to create a new invoice.';
        if (action === 'Cita') prompt = lang === 'es' ? 'Hola, necesito agendar una nueva cita.' : 'Hi, I need to schedule a new appointment.';
        if (action === 'Memoria') prompt = lang === 'es' ? 'NexoBot, genera una memoria de actividad en PDF.' : 'NexoBot, generate an activity report in PDF.';
        if (action === 'Cliente') prompt = lang === 'es' ? 'Quiero registrar un nuevo cliente.' : 'I want to register a new client.';
        if (action === 'Inventario') prompt = lang === 'es' ? 'Hola NexoBot, quiero ver o actualizar mi inventario.' : 'Hi NexoBot, I want to see or update my inventory.';
        setInput(prompt);
    };

    // Chat State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);

    const handleClearMessages = () => {
        if (messages.length > 0 && window.confirm(t.confirm_delete)) {
            setMessages([]);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'es' ? 'es-ES' : 'en-US';
        recognition.start();
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const response = await fetch(`${apiUrl}/api/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    tenant_id: user?.tenant_id || '',
                    industry_override: businessConfig.industry,
                    language: lang
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);

            // Si la IA realizó una acción (ej: agendar), recargamos el dashboard
            if (data.action_required && (data.intent === 'book_appointment' || data.intent === 'generate_invoice')) {
                loadDashboardData(token);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: 'NexoBot está descansando o hay un problema de red. Por favor intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveBusinessConfig = async (configOverride = null) => {
        setIsLoading(true);
        const configToSave = configOverride || businessConfig;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const response = await fetch(`${apiUrl}/api/v1/auth/tenant`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'token': token },
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
                    whatsapp_notifications_enabled: configToSave.whatsappNotificationsEnabled,
                    smtp_host: configToSave.smtp_host,
                    smtp_port: configToSave.smtp_port,
                    smtp_user: configToSave.smtp_user,
                    smtp_password: configToSave.smtp_password,
                    whatsapp_api_key: configToSave.whatsapp_api_key,
                    whatsapp_phone: configToSave.whatsapp_phone,
                    whatsapp_instance_id: configToSave.whatsapp_instance_id,
                    resend_api_key: configToSave.resend_api_key,
                    google_calendar_token: configToSave.google_calendar_token,
                    primary_color: configToSave.primary_color,
                    secondary_color: configToSave.secondary_color
                })
            });
            if (response.ok) {
                if (!configOverride) alert(t.save_success);
                setIsSettingsOpen(false);
            }
        } catch (error) {
            alert('Error al guardar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateQr = async () => {
        setIsGeneratingQr(true);
        setWhatsappPairingCode(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const response = await fetch(`${apiUrl}/api/v1/whatsapp/qr`, { headers: { 'token': token } });
            const data = await response.json();
            if (response.ok && data.qrcode) setWhatsappQr(data.qrcode);
            else if (data.status === 'CONNECTED') setWhatsappStatus('CONNECTED');
        } catch (error) {
            alert("Error al generar QR");
        } finally {
            setIsGeneratingQr(false);
        }
    };

    const handleGetPairingCode = async (phoneNumber) => {
        if (!phoneNumber) {
            alert(lang === 'es' ? "Por favor ingresa un número de teléfono" : "Please enter a phone number");
            return;
        }
        setIsGeneratingQr(true);
        setWhatsappQr(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const response = await fetch(`${apiUrl}/api/v1/whatsapp/pairing-code?number=${phoneNumber}`, {
                headers: { 'token': token }
            });
            const data = await response.json();
            if (response.ok && data.code) {
                setWhatsappPairingCode(data.code);
            } else if (data.status === 'CONNECTED') {
                setWhatsappStatus('CONNECTED');
            } else {
                alert(data.detail || "Error al generar código");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setIsGeneratingQr(false);
        }
    };

    const handleWhatsappLogout = async () => {
        if (!confirm('¿Desvincular WhatsApp?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            await fetch(`${apiUrl}/api/v1/whatsapp/logout`, { method: 'POST', headers: { 'token': token } });
            setWhatsappStatus('DISCONNECTED');
            setWhatsappQr(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubscription = async () => {
        if (!user || !user.tenant_id) {
            alert(lang === 'es' ? 'Error: Inicia sesión para suscribirte.' : 'Error: Log in to subscribe.');
            return;
        }
        setIsSubscribing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const price = 9.99;
            const response = await fetch(`${apiUrl}/api/v1/payments/create-checkout-session?tenant_id=${user.tenant_id}&amount=${price}`, { method: 'POST' });
            const data = await response.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            alert('Error al iniciar suscripción.');
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleTestWhatsapp = async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:8000' : 'https://fearless-nature-production.up.railway.app') : 'https://fearless-nature-production.up.railway.app');
            const response = await fetch(`${apiUrl}/api/v1/whatsapp/test-message`, {
                method: 'POST',
                headers: { 'token': token }
            });
            const data = await response.json();
            if (response.ok) alert("✅ Mensaje enviado! Revisa tu celular.");
            else alert("❌ Error: " + (data.detail || "No se pudo enviar"));
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };



    if (!isMounted) return <div className="min-h-screen bg-[#0f1115]" />;

    if (!isAuthenticated) return <AuthPage onAuthSuccess={handleAuthSuccess} />;

    return (
        <div className="min-h-screen bg-[#0f1115] text-white font-sans overflow-x-hidden md:flex relative">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-blob transition-all duration-1000" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-blob animation-delay-2000 transition-all duration-1000" />
            </div>

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                lang={lang}
                setLang={setLang}
                t={t}
                businessConfig={businessConfig}
                user={user}
                onlineCount={onlineCount}
                userCount={userCount}
                isLangMenuOpen={isLangMenuOpen}
                setIsLangMenuOpen={setIsLangMenuOpen}
                handleLogout={handleLogout}
                handleSubscription={handleSubscription}
                isSubscribing={isSubscribing}
                currentIndustry={currentIndustry}
                industries={industries}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
            />

            <main className="flex-1 w-full md:w-auto min-h-screen bg-transparent overflow-y-auto relative z-10 transition-all duration-500">
                <div className="md:hidden flex items-center justify-between p-4 bg-[#181a1f]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-sm tracking-tight text-gradient-premium">NexoBot V6.0</span>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}
                        className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-500/20"
                    >
                        Limpiar App
                    </button>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <header className="hidden md:flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 bg-white/5 rounded-2xl ${currentIndustry?.color || 'text-indigo-400'} shadow-lg shadow-black/20 backdrop-blur-sm`}>
                                {currentIndustry?.icon && <currentIndustry.icon size={28} />}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{businessConfig?.name || 'NexoBot'} <span className="text-[10px] font-black text-indigo-600 bg-indigo-600/10 px-2 py-1 rounded-md ml-2">CORE-V2</span></h1>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">{currentIndustry?.name || 'Smart Assistant'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                                <Search size={20} />
                            </button>
                            <div className="relative">
                                <button className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                                    <Bell size={20} />
                                </button>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-[#0f1115]">3</span>
                            </div>
                        </div>
                    </header>

                    <DashboardContent
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        currentIndustry={currentIndustry}
                        businessConfig={businessConfig}
                        dashboardData={dashboardData}
                        t={t}
                        lang={lang}
                        handleQuickAction={handleQuickAction}
                        handleSubscription={handleSubscription}
                        isSubscribing={isSubscribing}
                        mockFinancialData={mockFinancialData}
                        handleSocialShare={handleSocialShare}
                        user={user}
                        setBusinessConfig={setBusinessConfig}
                        handleSaveBusinessConfig={handleSaveBusinessConfig}
                    />
                </div>
            </main>

            <SettingsModal
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                businessConfig={businessConfig}
                setBusinessConfig={setBusinessConfig}
                t={t}
                lang={lang}
                industries={industries}
                handleSaveBusinessConfig={handleSaveBusinessConfig}
                handleGenerateQr={handleGenerateQr}
                handleGetPairingCode={handleGetPairingCode}
                handleWhatsappLogout={handleWhatsappLogout}
                whatsappQr={whatsappQr}
                whatsappPairingCode={whatsappPairingCode}
                isGeneratingQr={isGeneratingQr}
                whatsappStatus={whatsappStatus}
                handleTestWhatsapp={handleTestWhatsapp}
                isLoading={isLoading}
            />

            <AIChatAssistant
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                messages={messages}
                handleClearMessages={handleClearMessages}
                businessConfig={businessConfig}
                t={t}
                currentIndustry={currentIndustry}
                isLoading={isLoading}
                isListening={isListening}
                input={input}
                setInput={setInput}
                handleSendMessage={handleSendMessage}
                startListening={startListening}
                lang={lang}
            />

            <style jsx global>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .text-gradient-premium {
                    background: linear-gradient(to r, #6366f1, #22d3ee);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .dashboard-card {
                    background: rgba(24, 26, 31, 0.4);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 2.5rem;
                }
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.875rem 1rem;
                    color: #94a3b8;
                    border-radius: 1rem;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                .sidebar-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .sidebar-item-active {
                    background: rgba(99, 102, 241, 0.1);
                    color: #6366f1;
                    font-weight: 600;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }
            `}</style>
        </div>
    );
}
