"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
    X,
    Send,
    RotateCcw,
    Loader2,
    ChevronDown,
} from "lucide-react";

interface Message {
    role: "user" | "model";
    text: string;
}

// Derive a human-readable page context string from pathname
function getPageContext(pathname: string): string {
    const map: Record<string, string> = {
        "/admin": "Admin paneli ana sayfası (dashboard). Sipariş, ürün ve satış özeti görüntüleniyor.",
        "/admin/siparisler": "Siparişler sayfası. Tüm siparişlerin listesi ve durum yönetimi.",
        "/admin/urunler": "Ürünler sayfası. Ürün listesi, stok takibi ve ürün yönetimi.",
        "/admin/musteriler": "Müşteriler sayfası. Müşteri listesi ve detayları.",
        "/admin/indirimler": "İndirimler sayfası. Kupon ve kampanya yönetimi.",
        "/admin/analizler": "Analizler sayfası. Satış grafikleri ve performans verileri.",
        "/admin/cms": "CMS sayfası. Blog yazıları ve içerik yönetimi.",
        "/admin/seo-killer": "SEO sayfası. Arama motoru optimizasyon ayarları.",
        "/admin/pazarlama": "Pazarlama sayfası. Pazarlama araçları ve kampanyalar.",
        "/admin/ayarlar": "Ayarlar sayfası. Mağaza konfigürasyon ayarları.",
        "/admin/yoneticiler": "Yöneticiler sayfası. Admin kullanıcı yönetimi.",
        "/admin/markets": "Marketler sayfası.",
    };
    const exact = map[pathname];
    if (exact) return exact;
    // Partial matches
    for (const [key, val] of Object.entries(map)) {
        if (pathname.startsWith(key) && key !== "/admin") return val;
    }
    if (pathname.startsWith("/admin")) return `Admin paneli: ${pathname}`;
    return `Ezmeo web sitesi: ${pathname}`;
}

// Very simple markdown-like renderer (bold, code)
function renderText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code
                    key={i}
                    className="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

const QUICK_PROMPTS = [
    "Bugün ne yapmalıyım?",
    "Düşük stok uyarıları",
    "Kâr marjı nasıl hesaplanır?",
    "Bana yardımcı ol",
];

export default function ToshiAssistant() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus input when opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isMinimized]);

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
        // Show greeting on first open
        if (!isInitialized) {
            setIsInitialized(true);
            setMessages([
                {
                    role: "model",
                    text: "Merhaba! Ben **Toshi** 👋 Ezmeo'nun AI asistanıyım. Sana siparişler, ürünler, analizler veya matematiksel hesaplamalar konusunda yardımcı olabilirim. Ne öğrenmek istersin?",
                },
            ]);
        }
    };

    const sendMessage = useCallback(
        async (text?: string) => {
            const msgText = text ?? input.trim();
            if (!msgText || isLoading) return;

            const userMessage: Message = { role: "user", text: msgText };
            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);
            setInput("");
            setIsLoading(true);

            // Build Gemini-formatted history (exclude greeting from model history for cleanliness)
            const history = updatedMessages.map((m) => ({
                role: m.role,
                parts: [{ text: m.text }],
            }));

            try {
                const res = await fetch("/api/admin/assistant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: history,
                        context: getPageContext(pathname),
                    }),
                });

                const data = await res.json();
                const replyText =
                    data.text ?? "Üzgünüm, bir hata oluştu. Tekrar dene.";
                setMessages([...updatedMessages, { role: "model", text: replyText }]);
            } catch {
                setMessages([
                    ...updatedMessages,
                    {
                        role: "model",
                        text: "Bağlantı hatası oluştu. İnternet bağlantını kontrol et.",
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        },
        [input, isLoading, messages, pathname]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleReset = () => {
        setMessages([
            {
                role: "model",
                text: "Konuşma sıfırlandı! Ben **Toshi** 👋 Sana nasıl yardımcı olabilirim?",
            },
        ]);
        setInput("");
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    aria-label="Toshi AI Asistanı Aç"
                    className="fixed bottom-6 right-6 z-[9999] group"
                    style={{ filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.45))" }}
                >
                    <div
                        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                        }}
                    >
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-violet-500" />
                        {/* T letter */}
                        <span className="text-white text-xl font-bold tracking-tight select-none">
                            T
                        </span>
                    </div>
                    {/* Tooltip */}
                    <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Toshi&apos;ye sor
                    </span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[9999] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                        width: "360px",
                        height: isMinimized ? "56px" : "520px",
                        background: "#fff",
                        border: "1px solid rgba(124,58,237,0.15)",
                        boxShadow: "0 24px 64px rgba(124,58,237,0.18), 0 2px 16px rgba(0,0,0,0.08)",
                        transition: "height 0.25s cubic-bezier(.4,0,.2,1)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 flex-shrink-0 select-none"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">T</span>
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold leading-tight">
                                    Toshi
                                </p>
                                <p className="text-violet-200 text-xs leading-tight">
                                    AI Asistan · Her zaman aktif
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleReset}
                                title="Konuşmayı sıfırla"
                                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsMinimized((v) => !v)}
                                title="Küçült"
                                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <ChevronDown
                                    className="w-3.5 h-3.5 transition-transform duration-200"
                                    style={{ transform: isMinimized ? "rotate(180deg)" : "rotate(0deg)" }}
                                />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Kapat"
                                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role === "model" && (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                                <span className="text-white text-[10px] font-bold">T</span>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm"
                                                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                                                }`}
                                            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                        >
                                            {msg.role === "model"
                                                ? msg.text.split("\n").map((line, li) => (
                                                    <p key={li} className={li > 0 ? "mt-1" : ""}>
                                                        {renderText(line)}
                                                    </p>
                                                ))
                                                : msg.text}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                            <span className="text-white text-[10px] font-bold">T</span>
                                        </div>
                                        <div className="bg-white border border-gray-100 shadow-sm px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                            <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
                                            <span className="text-xs text-gray-400">Düşünüyor...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Prompts — show only before any user message */}
                            {messages.filter((m) => m.role === "user").length === 0 && (
                                <div className="px-4 pb-2 flex gap-1.5 flex-wrap bg-white border-t border-gray-100">
                                    {QUICK_PROMPTS.map((qp) => (
                                        <button
                                            key={qp}
                                            onClick={() => sendMessage(qp)}
                                            className="text-xs px-2.5 py-1 rounded-full border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors mt-2 whitespace-nowrap"
                                        >
                                            {qp}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                                <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all px-3 py-2">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Toshi'ye sor..."
                                        rows={1}
                                        className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-h-[20px] max-h-[80px] leading-5"
                                        style={{ overflow: "auto" }}
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isLoading}
                                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                                        style={{
                                            background:
                                                input.trim() && !isLoading
                                                    ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                                                    : "#e5e7eb",
                                        }}
                                    >
                                        <Send
                                            className="w-3.5 h-3.5"
                                            style={{ color: input.trim() && !isLoading ? "#fff" : "#9ca3af" }}
                                        />
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-gray-300 mt-1.5">
                                    Enter ile gönder · Shift+Enter yeni satır
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
