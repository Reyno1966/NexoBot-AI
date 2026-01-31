import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Check, Phone } from 'lucide-react';

const SettingsModal = ({
    isSettingsOpen,
    setIsSettingsOpen,
    businessConfig,
    setBusinessConfig,
    t,
    lang,
    industries,
    handleSaveBusinessConfig,
    handleGenerateQr,
    handleGetPairingCode,
    handleWhatsappLogout,
    handleTestWhatsapp,
    whatsappQr,
    whatsappPairingCode,
    isGeneratingQr,
    whatsappStatus,
    isLoading
}) => {
    return (
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
                                        <img src={businessConfig.logoUrl} className="w-full h-full object-contain" alt="Logo" />
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

                            {/* Horarios de Atención */}
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

                            {/* Pasarela de Pagos */}
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

                            {/* Canales de Comunicación */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-2 block">📡 Connectividad (Email & WhatsApp Propios)</label>
                                <p className="text-[10px] text-slate-500 ml-2">Configura tus propios canales para que NexoBot envíe las alertas directamente desde tus cuentas.</p>

                                <div className="bg-white/[0.02] p-4 rounded-3xl border border-white/5 space-y-4">
                                    <h4 className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Servidor de Correo (SMTP o Resend)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="SMTP Host (ej: smtp.gmail.com)"
                                            value={businessConfig.smtp_host}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, smtp_host: e.target.value })}
                                            className="bg-[#0f1115] border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-cyan-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Puerto (ej: 587)"
                                            value={businessConfig.smtp_port}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, smtp_port: parseInt(e.target.value) })}
                                            className="bg-[#0f1115] border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-cyan-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Email / Usuario SMTP"
                                            value={businessConfig.smtp_user}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, smtp_user: e.target.value })}
                                            className="bg-[#0f1115] border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-cyan-500"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Contraseña SMTP"
                                            value={businessConfig.smtp_password}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, smtp_password: e.target.value })}
                                            className="bg-[#0f1115] border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-[9px] text-slate-500 mb-2 uppercase font-bold tracking-widest">O usa Resend (Recomendado Premium)</p>
                                        <input
                                            type="text"
                                            placeholder="Resend API Key (re_...)"
                                            value={businessConfig.resend_api_key}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, resend_api_key: e.target.value })}
                                            className="w-full bg-[#0f1115] border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                                            <Phone className="text-green-500" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold">Activar Notificaciones de WhatsApp</h4>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Configuración automática para alertas</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {whatsappStatus === 'CONNECTED' ? (
                                            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[2rem] flex flex-col items-center gap-4 text-center">
                                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                                    <Check className="text-white" size={40} />
                                                </div>
                                                <div>
                                                    <h5 className="text-xl font-bold text-green-400">¡WhatsApp Vinculado!</h5>
                                                    <p className="text-sm text-slate-400 max-w-sm mt-2">Tu asistente ya puede enviar mensajes directamente desde tu número a tus clientes.</p>
                                                </div>
                                                <div className="flex gap-3 w-full max-w-xs mt-4">
                                                    <button onClick={handleTestWhatsapp} className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold uppercase transition-all">Probador</button>
                                                    <button onClick={handleWhatsappLogout} className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl text-xs font-bold uppercase transition-all border border-red-500/10">Desconectar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Método 1: QR */}
                                                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col items-center gap-5">
                                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Paso 1: Escanear QR</span>

                                                    {whatsappQr ? (
                                                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-4 rounded-3xl shadow-2xl">
                                                            <img src={whatsappQr} alt="WhatsApp QR" className="w-44 h-44" />
                                                        </motion.div>
                                                    ) : (
                                                        <div className="w-44 h-44 bg-black/40 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2">
                                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-[10px] text-slate-600 font-bold uppercase">Esperando...</span>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={handleGenerateQr}
                                                        disabled={isGeneratingQr}
                                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-bold shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50"
                                                    >
                                                        {isGeneratingQr ? 'Cargando código...' : 'Ver Código QR'}
                                                    </button>
                                                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">Abre WhatsApp en tu móvil ➔ Configuración ➔ Dispositivos vinculados</p>
                                                </div>

                                                {/* Método 2: Código */}
                                                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col items-center gap-5">
                                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-[0.2em]">Paso 2: Código directo</span>

                                                    {whatsappPairingCode ? (
                                                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-green-500/10 border border-green-500/20 w-44 h-44 rounded-3xl flex flex-col items-center justify-center gap-2">
                                                            <span className="text-4xl font-mono font-black text-green-400 tracking-[0.2em]">{whatsappPairingCode}</span>
                                                            <span className="text-[8px] text-green-500/60 font-bold uppercase">Ingresa esto en tu cel</span>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="w-44 h-44 flex flex-col justify-center gap-3">
                                                            <label className="text-[9px] text-slate-500 text-center font-bold">TU NÚMERO DE WHATSAPP</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Ej: 521..."
                                                                value={businessConfig.whatsapp_phone || ''}
                                                                onChange={(e) => setBusinessConfig({ ...businessConfig, whatsapp_phone: e.target.value })}
                                                                className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-center text-sm font-bold font-mono outline-none focus:border-green-500"
                                                            />
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => handleGetPairingCode(businessConfig.whatsapp_phone)}
                                                        disabled={!businessConfig.whatsapp_phone || isGeneratingQr}
                                                        className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-2xl text-xs font-bold shadow-xl shadow-green-600/20 transition-all disabled:opacity-50"
                                                    >
                                                        {isGeneratingQr ? 'Generando...' : 'Obtener Código'}
                                                    </button>
                                                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">Usa el número que quieres conectar (con código de país sin el +)</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-indigo-500/5 p-5 rounded-[1.5rem] border border-indigo-500/10 flex items-center gap-4">
                                            <div className="text-2xl">💡</div>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                <b className="text-indigo-400 underline italic">¿No tienes tiempo de conectar?</b> No te preocupes, NexoBot usará su <b className="text-white">Asistente Central</b> para notificarte de todas formas hasta que vincules tu cuenta.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveBusinessConfig}
                                disabled={isLoading}
                                className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl text-lg mt-8 disabled:opacity-50"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar y Transformar Aplicación'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
