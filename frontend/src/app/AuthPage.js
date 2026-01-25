import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Bot, ChevronRight, UserPlus, LogIn, ArrowLeft, Scissors, Stethoscope, Gavel, Home, Hotel, Briefcase, Phone, MapPin, Building, Calendar, FileText, Share2, Globe } from 'lucide-react';
import { translations } from './i18n';

export default function AuthPage({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [industry, setIndustry] = useState('barber');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [interest, setInterest] = useState('Citas'); // Nuevo: Automatizar Citas, Facturas, Marketing, Asistente
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lang, setLang] = useState('es');
    const t = translations[lang];

    const industries = [
        { id: 'barber', name: 'Barbería / Estética', icon: Scissors },
        { id: 'health', name: 'Odontólogo / Salud', icon: Stethoscope },
        { id: 'legal', name: 'Abogado / Legal', icon: Gavel },
        { id: 'realestate', name: 'Inmobiliaria', icon: Home },
        { id: 'rental', name: 'Alquiler / Turismo', icon: Hotel },
        { id: 'consulting', name: 'Consultoría', icon: Briefcase },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isForgotPassword) {
            handleForgotPassword();
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexobot-ai.onrender.com';

        try {
            let response;
            if (isLogin) {
                const formData = new FormData();
                formData.append('username', email);
                formData.append('password', password);

                response = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    body: formData,
                });
            } else {
                response = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        industry,
                        phone,
                        address,
                        country,
                        main_interest: interest
                    }),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Algo salió mal');
            }

            if (isLogin) {
                localStorage.setItem('token', data.access_token);
                onAuthSuccess(data.access_token);
            } else {
                // Después de registrar, pasar a login
                setIsLogin(true);
                setError('¡Registro exitoso! Ahora puedes iniciar sesión.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setIsLoading(true);
        setError('');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexobot-ai.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setError(data.message);
                setTimeout(() => {
                    setIsForgotPassword(false);
                    setError('');
                }, 5000);
            } else {
                setError(data.detail || 'Error al enviar el correo');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full transition-all duration-500 overflow-hidden ${isLogin || isForgotPassword ? 'max-w-md' : 'max-w-md md:max-w-2xl'}`}
            >
                <div className="bg-[#181a1f]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 scale-90 md:scale-100 origin-left">
                            {Object.keys(translations).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === l ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <Globe size={16} className="hidden md:block text-slate-500" />
                    </div>

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-2xl shadow-cyan-500/20">
                            <img src="/logo.jpg" alt="NexoBot" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2 text-center">
                            {isForgotPassword ? t.auth.forgot_pass : (isLogin ? t.auth.login_title : t.auth.register_title)}
                        </h2>
                        <p className="text-slate-400 text-sm text-center">
                            {isForgotPassword ? (lang === 'es' ? 'Introduce tu email para recuperar tu acceso' : 'Enter your email to recover access') : (isLogin ? t.auth.login_desc : t.auth.register_desc)}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.auth.email}</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@empresa.com"
                                    className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-3 md:py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all text-white font-medium text-sm md:text-base"
                                />
                            </div>
                        </div>

                        {!isForgotPassword && (
                            <>
                                <div className={`grid gap-5 ${!isLogin ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-4">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.auth.pass}</label>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={20} />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-3 md:py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition-all text-white font-medium shadow-inner text-sm md:text-base"
                                            />
                                        </div>
                                    </div>

                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.auth.repeat_pass}</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all text-white font-medium shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4 pt-4 border-t border-white/5"
                                    >
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4 block mb-3">{t.auth.tool_select}</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                                                {industries.map((ind) => (
                                                    <button
                                                        key={ind.id}
                                                        type="button"
                                                        onClick={() => setIndustry(ind.id)}
                                                        className={`p-3 md:p-4 rounded-2xl border text-[9px] md:text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-2 md:gap-3 relative overflow-hidden group/item ${industry === ind.id ? 'bg-cyan-600 border-cyan-400 text-white shadow-xl shadow-cyan-600/20 scale-[1.02]' : 'bg-[#0f1115] border-white/5 text-slate-400 hover:border-white/10'}`}
                                                    >
                                                        {industry === ind.id && <div className="absolute top-0 right-0 p-1 bg-white/20 rounded-bl-xl text-[7px] md:text-[8px]">Ok</div>}
                                                        <ind.icon size={18} className={industry === ind.id ? 'text-white' : 'text-slate-500 group-hover/item:text-cyan-400 transition-colors'} />
                                                        <span className="text-center leading-tight">{t.industries[ind.id].name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4 block mb-3">{t.objective_label}</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'Citas', label: lang === 'es' ? 'Automatizar Citas' : 'Automate Appointments', icon: Calendar },
                                                    { id: 'Facturas', label: lang === 'es' ? 'Gestionar Facturas' : 'Manage Invoices', icon: FileText },
                                                    { id: 'Marketing', label: lang === 'es' ? 'Marketing y WhatsApp' : 'Marketing & WhatsApp', icon: Share2 },
                                                    { id: 'Asistente', label: lang === 'es' ? 'Asistente Virtual 24/7' : '24/7 Virtual Assistant', icon: Bot },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => setInterest(opt.id)}
                                                        className={`p-3 md:p-4 rounded-2xl border text-[9px] md:text-[10px] font-bold uppercase transition-all flex items-center gap-2 md:gap-3 ${interest === opt.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-[#0f1115] border-white/5 text-slate-400 hover:border-white/10'}`}
                                                    >
                                                        <opt.icon size={16} className={interest === opt.id ? 'text-white' : 'text-slate-500'} />
                                                        <span>{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">{t.phone_label}</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        placeholder="+1 (555) 000-0000"
                                                        className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all text-sm text-white font-medium"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">{t.country_label}</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={country}
                                                        onChange={(e) => setCountry(e.target.value)}
                                                        placeholder="Ej: España, México..."
                                                        className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all text-sm text-white font-medium"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">{t.address_label}</label>
                                                <div className="relative group">
                                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        placeholder={lang === 'es' ? "Puedes añadirla más tarde..." : "You can add it later..."}
                                                        className="w-full bg-[#0f1115] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all text-sm text-white font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                        {isLogin && !isForgotPassword && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsForgotPassword(true);
                                }}
                                className="w-full py-3 mb-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 group hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                            >
                                <Lock size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                                <span className="text-[11px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">
                                    {t.auth.forgot_pass}
                                </span>
                            </button>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={`text-xs p-4 rounded-xl text-center font-medium ${error.includes('exitoso') || error.includes('instrucciones') || error.includes('successful') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isForgotPassword ? (lang === 'es' ? "ENVIAR EMAIL DE RECUPERACIÓN" : "SEND RECOVERY EMAIL") : (isLogin ? t.auth.login_btn : t.auth.register_btn)}
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-5">


                        <button
                            type="button"
                            onClick={() => {
                                if (isForgotPassword) {
                                    setIsForgotPassword(false);
                                } else {
                                    setIsLogin(!isLogin);
                                }
                                setError('');
                            }}
                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {isForgotPassword || !isLogin ? (
                                <><ArrowLeft size={16} /> {t.auth.back_to_login}</>
                            ) : (
                                <>{t.auth.no_account.split('?')[0]}? <span className="text-cyan-400 font-bold ml-1">{t.auth.no_account.split('?')[1]}</span></>
                            )}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                    Poder de Cómputo por Gemini 2.0 Flash Security Certified
                </p>
            </motion.div>
        </div>
    );
}
