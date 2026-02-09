"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addPaymentGateway, validatePaymentGatewayConfig, getDefaultPaymentGatewayConfig } from "@/lib/payments";
import { PaymentGateway, PaymentGatewayFormState } from "@/types/payment";
import {
    ArrowLeft,
    Save,
    CreditCard,
    Building2,
    DollarSign,
    Package,
    RefreshCw,
    Settings,
    Lock,
    LucideIcon,
} from "lucide-react";
import Link from "next/link";

const GATEWAYS: { value: PaymentGateway; name: string; description: string; icon: LucideIcon }[] = [
    { value: "paytr", name: "PAYTR", description: "Türkiye'nin en popüler ödeme sistemlerinden biri", icon: CreditCard },
    { value: "iyzico", name: "İYZİCO", description: "Türk Telekom iştiraki modern ödeme çözümü", icon: Building2 },
    { value: "stripe", name: "Stripe", description: "Global ödeme çözümleri ve kart işleme", icon: DollarSign },
    { value: "bank_transfer", name: "Banka Hesabına Ödeme", description: "Havale ve EFT ile güvenli ödeme", icon: Building2 },
    { value: "cod", name: "Kapıda Ödeme", description: "Teslimat anında nakit ödeme seçeneği", icon: Package },
];

export default function NewPaymentGatewayPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | "">("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    // ... (show errors if any)

    const [formData, setFormData] = useState<PaymentGatewayFormState>({
        gateway: "",
        name: "",
        description: "",
        status: "inactive",
        environment: "sandbox",
        merchantId: "",
        apiKey: "",
        apiSecret: "",
        publicKey: "",
        clientId: "",
        secretKey: "",
        webhookUrl: "",
        bankAccount: {
            bankName: "",
            iban: "",
            accountHolder: "",
            swift: "",
            currency: "TRY",
        },
        codSettings: {
            minOrderAmount: 0,
            maxOrderAmount: 10000,
            applicableRegions: ["TÜRKİYE"],
            instructions: "",
        },
        supportedCardTypes: ["Visa", "MasterCard"],
        supportedMethods: [],
        currency: "TRY",
    });

    const handleGatewaySelect = (gateway: PaymentGateway) => {
        setSelectedGateway(gateway);
        const defaultConfig = getDefaultPaymentGatewayConfig(gateway);
        setFormData(defaultConfig);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedGateway) {
            toast.error("Lütfen bir ödeme yöntemi seçiniz.");
            setErrors({ gateway: "Ödeme yöntemi seçilmelidir" });
            return;
        }

        const validationErrors = validatePaymentGatewayConfig(formData, selectedGateway);
        setErrors(validationErrors.reduce((acc, err, idx) => ({ ...acc, [idx]: err }), {}));

        if (validationErrors.length > 0) {
            toast.error("Lütfen formdaki hataları düzeltiniz.");
            return;
        }

        setSaving(true);

        try {
            await addPaymentGateway(formData);
            toast.success("Ödeme yöntemi başarıyla eklendi.");
            router.push("/admin/ayarlar/odeme");
            router.refresh();
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Kaydetme sırasında bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/ayarlar/odeme"
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Geri Dön
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Yeni Ödeme Yöntemi</h1>
                        <p className="text-gray-500 text-sm">Ödeme gateway&apos;ını yapılandırın</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving || !selectedGateway}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {saving ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Kaydediliyor...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Kaydet
                        </>
                    )}
                </button>
            </div>

            {!selectedGateway ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Ödeme Yöntemi Seçin</h2>
                        <p className="text-gray-500 text-sm">
                            Yapılandırmak istediğiniz ödeme yöntemini seçin
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GATEWAYS.map((gateway) => {
                            const Icon = gateway.icon;
                            return (
                                <button
                                    key={gateway.value}
                                    onClick={() => handleGatewaySelect(gateway.value)}
                                    className="p-6 border border-gray-200 rounded-xl text-left hover:border-gray-900 hover:shadow-md transition-all group bg-gray-50/30"
                                >
                                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                                        <Icon className="w-6 h-6 text-gray-700" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {gateway.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2">{gateway.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h3 className="text-red-800 font-bold text-sm mb-2">Lütfen aşağıdaki hataları düzeltin:</h3>
                                <ul className="list-disc list-inside text-sm text-red-700">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Gateway Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <Settings className="w-4 h-4 text-gray-600" />
                                </div>
                                <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ödeme Yöntemi
                                    </label>
                                    <div className="p-3 bg-blue-50 text-blue-700 rounded-lg inline-block font-medium text-sm border border-blue-100">
                                        {GATEWAYS.find(g => g.value === selectedGateway)?.name}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ödeme Yöntemi Adı <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Örn: PAYTR Ödeme"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Açıklama
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Ödeme yöntemi açıklaması..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* API Configuration */}
                        {(selectedGateway === "paytr" || selectedGateway === "iyzico" || selectedGateway === "stripe") && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                        <Lock className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h2 className="font-semibold text-gray-900">API Yapılandırması</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    {selectedGateway === "paytr" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Merchant ID <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.merchantId}
                                                    onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    API Key <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.apiKey}
                                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    API Secret <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.apiSecret}
                                                    onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                    {/* Add IYZICO and STRIPE fields similarly if needed, keeping code brief for this example but retaining functionality */}
                                    {selectedGateway === "iyzico" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    API Key <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.apiKey}
                                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Secret Key <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.secretKey}
                                                    onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {selectedGateway === "stripe" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Public Key <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.publicKey}
                                                    onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Secret Key <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.secretKey}
                                                    onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono text-sm"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bank Account and COD fields omitted for brevity to stay within token limits but logic remains... 
                  Actually I should include them to be safe.
              */}
                        {selectedGateway === "bank_transfer" && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                    <h2 className="font-semibold text-gray-900">Banka Bilgileri</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Banka Adı <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.bankAccount?.bankName} onChange={e => setFormData({ ...formData, bankAccount: { ...formData.bankAccount!, bankName: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">IBAN <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.bankAccount?.iban} onChange={e => setFormData({ ...formData, bankAccount: { ...formData.bankAccount!, iban: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Sahibi <span className="text-red-500">*</span></label>
                                        <input type="text" value={formData.bankAccount?.accountHolder} onChange={e => setFormData({ ...formData, bankAccount: { ...formData.bankAccount!, accountHolder: e.target.value } })} placeholder="Hesap sahibinin tam adı" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedGateway === "cod" && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                    <h2 className="font-semibold text-gray-900">Kapıda Ödeme Detayları</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Tutar</label>
                                            <input type="number" value={formData.codSettings?.minOrderAmount} onChange={e => setFormData({ ...formData, codSettings: { ...formData.codSettings!, minOrderAmount: parseFloat(e.target.value) } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Tutar</label>
                                            <input type="number" value={formData.codSettings?.maxOrderAmount} onChange={e => setFormData({ ...formData, codSettings: { ...formData.codSettings!, maxOrderAmount: parseFloat(e.target.value) } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </form>
            )}
        </div>
    );
}
