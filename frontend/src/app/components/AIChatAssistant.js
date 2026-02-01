"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, Trash2, Plus, Users, Mic, Send } from 'lucide-react';

const AIChatAssistant = ({
    isChatOpen,
    setIsChatOpen,
    messages,
    handleClearMessages,
    businessConfig,
    t,
    currentIndustry,
    isLoading,
    isListening,
    input,
    setInput,
    handleSendMessage,
    startListening,
    lang
}) => {
    return (
        <>
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
                                                {t?.mode_active?.replace('{mode}', currentIndustry?.name || 'IA') || `AI Mode Active`}
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
                                                Te doy la bienvenida a tus <span className="text-cyan-400 font-bold">3 días de prueba gratuita</span>.
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
                                                {(msg.text || "").split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
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
        </>
    );
};

export default AIChatAssistant;
