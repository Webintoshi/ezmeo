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

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
    role: "user" | "model";
    text: string;
}

interface AlertInfo {
    count: number;
    summary: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "toshi_messages";
const ALERT_CACHE_KEY = "toshi_alerts";
const MAX_STORED_MESSAGES = 50;
const MAX_GEMINI_MESSAGES = 10;
const ALERT_CHECK_INTERVAL = 5 * 60 * 1000;

// ─── Page-aware Quick Prompts ────────────────────────────────────────────────
function getQuickPrompts(pathname: string): string[] {
    if (pathname === "/admin" || pathname === "/admin/")
        return [
            "Mağaza özeti",
            "Bekleyen siparişler",
            "Düşük stok uyarıları",
            "Müşteri istatistikleri",
        ];
    if (pathname.startsWith("/admin/siparisler"))
        return [
            "Sipariş özeti",
            "Bekleyen siparişler",
            "Son siparişler",
            "Bugünkü gelir",
        ];
    if (pathname.startsWith("/admin/urunler"))
        return [
            "Stok durumu",
            "Düşük stok uyarıları",
            "Kategori listesi",
            "Stok değeri hesapla",
        ];
    if (pathname.startsWith("/admin/musteriler"))
        return [
            "Müşteri istatistikleri",
            "Bu ay yeni müşteri",
            "Ortalama sipariş değeri nedir?",
        ];
    if (pathname.startsWith("/admin/indirimler"))
        return [
            "Aktif indirimler",
            "%20 indirimde kâr marjı hesapla",
            "İndirim önerisi",
        ];
    if (pathname.startsWith("/admin/analizler"))
        return [
            "Mağaza özeti",
            "Gelir analizi",
            "Ortalama sipariş değeri",
            "Büyüme oranı",
        ];
    if (pathname.startsWith("/admin/pazarlama"))
        return [
            "Pazarlama önerisi",
            "Kampanya fikri",
            "Müşteri segmenti analizi",
        ];
    if (pathname.startsWith("/admin/cms"))
        return [
            "Blog yazısı önerisi",
            "SEO ipuçları",
            "İçerik stratejisi",
        ];
    if (pathname.startsWith("/admin/seo"))
        return [
            "SEO durumu",
            "Anahtar kelime önerisi",
            "Meta açıklama nasıl yazılır?",
        ];
    return [
        "Mağaza özeti",
        "Düşük stok uyarıları",
        "Son siparişler",
        "Yardım",
    ];
}

// ─── Page Context ────────────────────────────────────────────────────────────
function getPageContext(pathname: string): string {
    const map: Record<string, string> = {
        "/admin":
            "Admin paneli ana sayfası (dashboard). Sipariş, ürün ve satış özeti görüntüleniyor.",
        "/admin/siparisler":
            "Siparişler sayfası. Tüm siparişlerin listesi ve durum yönetimi.",
        "/admin/urunler":
            "Ürünler sayfası. Ürün listesi, stok takibi ve ürün yönetimi.",
        "/admin/musteriler":
            "Müşteriler sayfası. Müşteri listesi ve detayları.",
        "/admin/indirimler":
            "İndirimler sayfası. Kupon ve kampanya yönetimi.",
        "/admin/analizler":
            "Analizler sayfası. Satış grafikleri ve performans verileri.",
        "/admin/cms":
            "CMS sayfası. Blog yazıları ve içerik yönetimi.",
        "/admin/seo-killer":
            "SEO sayfası. Arama motoru optimizasyon ayarları.",
        "/admin/pazarlama":
            "Pazarlama sayfası. Pazarlama araçları ve kampanyalar.",
        "/admin/ayarlar":
            "Ayarlar sayfası. Mağaza konfigürasyon ayarları.",
        "/admin/yoneticiler":
            "Yöneticiler sayfası. Admin kullanıcı yönetimi.",
        "/admin/markets": "Marketler sayfası.",
    };
    const exact = map[pathname];
    if (exact) return exact;
    for (const [key, val] of Object.entries(map)) {
        if (pathname.startsWith(key) && key !== "/admin") return val;
    }
    if (pathname.startsWith("/admin")) return `Admin paneli: ${pathname}`;
    return `Ezmeo web sitesi: ${pathname}`;
}

// ─── Enhanced Markdown Renderer ──────────────────────────────────────────────
function renderLine(text: string): React.ReactNode[] {
    // Bold + code + emoji rendering
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={i} className="font-semibold">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code
                    key={i}
                    className="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded font-mono"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

function renderMessage(text: string) {
    const lines = text.split("\n");
    return lines.map((line, li) => {
        const trimmed = line.trim();

        // Heading-like lines (emoji + ALL CAPS)
        if (/^[📊🛒📦👥⚠️🔴🟢🟡💰📈📉✅❌🎯⭐💡🔔🏷️]/.test(trimmed)) {
            return (
                <p key={li} className={`${li > 0 ? "mt-2" : ""} font-semibold`}>
                    {renderLine(line)}
                </p>
            );
        }

        // Bullet points (- or · or •)
        if (/^\s*[-·•]\s/.test(line)) {
            const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
            const content = line.replace(/^\s*[-·•]\s*/, "");
            return (
                <div
                    key={li}
                    className="flex gap-1.5"
                    style={{ paddingLeft: `${Math.min(indent, 4) * 4}px` }}
                >
                    <span className="text-violet-400 flex-shrink-0 mt-0.5">•</span>
                    <span>{renderLine(content)}</span>
                </div>
            );
        }

        // Numbered lists
        if (/^\s*\d+[.)]\s/.test(line)) {
            const match = line.match(/^\s*(\d+)[.)]\s*(.*)/);
            if (match) {
                return (
                    <div key={li} className="flex gap-1.5">
                        <span className="text-violet-500 font-medium flex-shrink-0 min-w-[16px]">
                            {match[1]}.
                        </span>
                        <span>{renderLine(match[2])}</span>
                    </div>
                );
            }
        }

        // Empty lines → spacer
        if (trimmed === "") {
            return <div key={li} className="h-1" />;
        }

        // Normal paragraph
        return (
            <p key={li} className={li > 0 ? "mt-1" : ""}>
                {renderLine(line)}
            </p>
        );
    });
}

// ─── localStorage helpers ────────────────────────────────────────────────────
function loadMessages(): Message[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return (JSON.parse(stored) as Message[]).slice(-MAX_STORED_MESSAGES);
    } catch {
        return [];
    }
}

function saveMessages(messages: Message[]) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(messages.slice(-MAX_STORED_MESSAGES))
        );
    } catch { }
}

function clearMessages() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch { }
}

function loadAlertCache(): { data: AlertInfo; ts: number } | null {
    try {
        const raw = localStorage.getItem(ALERT_CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function saveAlertCache(data: AlertInfo) {
    try {
        localStorage.setItem(
            ALERT_CACHE_KEY,
            JSON.stringify({ data, ts: Date.now() })
        );
    } catch { }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ToshiAssistant() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ─── Admin-only visibility ──
    const isAdmin = pathname.startsWith("/admin");

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isMinimized]);

    // ─── Keyboard shortcut: Ctrl+K / Esc ──
    useEffect(() => {
        if (!isAdmin) return;

        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                if (isOpen) {
                    inputRef.current?.focus();
                } else {
                    handleOpen();
                }
            }
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isAdmin]);

    // ─── Proactive Alert Check (admin pages only) ──
    useEffect(() => {
        if (!isAdmin) {
            setAlertInfo(null);
            return;
        }

        const checkAlerts = async () => {
            const cached = loadAlertCache();
            if (cached && Date.now() - cached.ts < ALERT_CHECK_INTERVAL) {
                setAlertInfo(cached.data);
                return;
            }

            try {
                const [ordersRes, productsRes] = await Promise.all([
                    fetch("/api/orders?stats=true")
                        .then((r) => r.json())
                        .catch(() => null),
                    fetch("/api/products?limit=100")
                        .then((r) => r.json())
                        .catch(() => null),
                ]);

                let count = 0;
                const alerts: string[] = [];

                const pending = ordersRes?.stats?.pending || 0;
                if (pending > 0) {
                    count += pending;
                    alerts.push(`${pending} bekleyen sipariş`);
                }

                const lowStockProducts = (productsRes?.products || []).filter(
                    (p: { variants?: { stock: number }[] }) =>
                        p.variants?.some((v) => v.stock < 10)
                );
                if (lowStockProducts.length > 0) {
                    count += lowStockProducts.length;
                    alerts.push(`${lowStockProducts.length} düşük stoklu ürün`);
                }

                const info: AlertInfo = {
                    count,
                    summary: alerts.length > 0 ? alerts.join(" · ") : "",
                };

                setAlertInfo(info.count > 0 ? info : null);
                saveAlertCache(info);
            } catch {
                // Silently fail
            }
        };

        checkAlerts();
        const interval = setInterval(checkAlerts, ALERT_CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, [isAdmin]);

    // ─── Open Handler ──
    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);

        if (!isInitialized) {
            setIsInitialized(true);
            const stored = loadMessages();
            if (stored.length > 0) {
                setMessages(stored);
            } else {
                let greeting =
                    "Merhaba! Ben **Toshi** 👋 Ezmeo'nun AI asistanıyım.\n\nSana **gerçek zamanlı** sipariş, ürün ve müşteri verileriyle yardımcı olabilirim. Matematiksel hesaplamalar da yapabilirim.";
                if (alertInfo && alertInfo.count > 0) {
                    greeting += `\n\n⚠️ **Dikkat:** ${alertInfo.summary}. Detay için sor!`;
                }
                greeting += "\n\nNe öğrenmek istersin?";
                const msgs: Message[] = [{ role: "model", text: greeting }];
                setMessages(msgs);
                saveMessages(msgs);
            }
        }
    };

    // ─── Send Message ──
    const sendMessage = useCallback(
        async (text?: string) => {
            const msgText = text ?? input.trim();
            if (!msgText || isLoading) return;

            const userMessage: Message = { role: "user", text: msgText };
            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);
            saveMessages(updatedMessages);
            setInput("");
            setIsLoading(true);

            const trimmedForGemini = updatedMessages.slice(-MAX_GEMINI_MESSAGES);
            const history = trimmedForGemini.map((m) => ({
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

                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Bir hata oluştu. Tekrar dene.";
                    const withError = [
                        ...updatedMessages,
                        { role: "model" as const, text: `⚠️ ${errorMsg}` },
                    ];
                    setMessages(withError);
                    saveMessages(withError);
                } else {
                    const replyText = data.text ?? "Üzgünüm, yanıt oluşturulamadı.";
                    const withReply = [
                        ...updatedMessages,
                        { role: "model" as const, text: replyText },
                    ];
                    setMessages(withReply);
                    saveMessages(withReply);
                }
            } catch {
                const withError = [
                    ...updatedMessages,
                    {
                        role: "model" as const,
                        text: "⚠️ Bağlantı hatası oluştu. İnternet bağlantını kontrol et.",
                    },
                ];
                setMessages(withError);
                saveMessages(withError);
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
        const greeting: Message[] = [
            {
                role: "model",
                text: "Konuşma sıfırlandı! Ben **Toshi** 👋 Sana nasıl yardımcı olabilirim?",
            },
        ];
        setMessages(greeting);
        clearMessages();
        saveMessages(greeting);
        setInput("");
    };

    // ─── Don't render on non-admin pages ──
    if (!isAdmin) return null;

    const quickPrompts = getQuickPrompts(pathname);

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    aria-label="Toshi AI Asistanı Aç (Ctrl+K)"
                    className="fixed bottom-6 right-6 z-[9999] group"
                    style={{
                        filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.45))",
                    }}
                >
                    <div
                        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                        style={{
                            background:
                                "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                        }}
                    >
                        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-violet-500" />
                        <span className="text-white text-xl font-bold tracking-tight select-none">
                            T
                        </span>

                        {/* Alert Badge */}
                        {alertInfo && alertInfo.count > 0 && (
                            <span
                                className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg"
                                style={{
                                    animation:
                                        "toshi-badge-pulse 2s ease-in-out infinite",
                                }}
                            >
                                {alertInfo.count > 9 ? "9+" : alertInfo.count}
                            </span>
                        )}
                    </div>

                    <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {alertInfo && alertInfo.count > 0
                            ? alertInfo.summary
                            : "Toshi'ye sor (Ctrl+K)"}
                    </span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[9999] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                        width: "400px",
                        height: isMinimized ? "56px" : "560px",
                        background: "#fff",
                        border: "1px solid rgba(124,58,237,0.15)",
                        boxShadow:
                            "0 24px 64px rgba(124,58,237,0.18), 0 2px 16px rgba(0,0,0,0.08)",
                        transition: "height 0.25s cubic-bezier(.4,0,.2,1)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 flex-shrink-0 select-none"
                        style={{
                            background:
                                "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
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
                                    AI Asistan · Gerçek zamanlı
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
                                    style={{
                                        transform: isMinimized
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                    }}
                                />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Kapat (Esc)"
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
                                                <span className="text-white text-[10px] font-bold">
                                                    T
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm"
                                                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                                                }`}
                                            style={{
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {msg.role === "model"
                                                ? renderMessage(msg.text)
                                                : msg.text}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                            <span className="text-white text-[10px] font-bold">
                                                T
                                            </span>
                                        </div>
                                        <div className="bg-white border border-gray-100 shadow-sm px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                            <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
                                            <span className="text-xs text-gray-400">
                                                Veri çekiliyor...
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Prompts */}
                            {messages.filter((m) => m.role === "user").length === 0 && (
                                <div className="px-4 pb-2 flex gap-1.5 flex-wrap bg-white border-t border-gray-100">
                                    {quickPrompts.map((qp) => (
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
                                            style={{
                                                color:
                                                    input.trim() && !isLoading
                                                        ? "#fff"
                                                        : "#9ca3af",
                                            }}
                                        />
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-gray-300 mt-1.5">
                                    Enter ile gönder · Ctrl+K kısayol · Esc kapat
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Badge pulse animation */}
            <style jsx global>{`
        @keyframes toshi-badge-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
      `}</style>
        </>
    );
}
