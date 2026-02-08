"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    getPaymentGatewayById,
    updatePaymentGateway,
    testPaymentGatewayConnection,
    validatePaymentGatewayConfig,
} from "@/lib/payments";
import { PaymentGatewayConfig, PaymentGateway } from "@/types/payment";
import {
    ArrowLeft,
    Save,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Zap,
    Settings,
    Lock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";


export default function EditPaymentGatewayPage() {
    const router = useRouter();
    const params = useParams();
    const gatewayId = params.id as string;

    const [gateway, setGateway] = useState<PaymentGatewayConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({}); // Used for validation logic
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState<boolean | null>(null);

    useEffect(() => {
        if (gatewayId) {
            // Simulate async data fetching or ensure it doesn't trigger synchronous re-render in effect
            const timer = setTimeout(() => {
                const loadedGateway = getPaymentGatewayById(gatewayId);
                if (loadedGateway) {
                    setGateway(loadedGateway);
                } else {
                    router.push("/admin/ayarlar/odeme");
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [gatewayId, router]);

    const handleToggleStatus = () => {
        if (!gateway) return;

        const newStatus = gateway.status === "active" ? "inactive" : "active";
        updatePaymentGateway(gatewayId, { status: newStatus });
        setGateway({ ...gateway, status: newStatus, updatedAt: new Date() });
    };

    const handleToggleEnvironment = () => {
        if (!gateway) return;

        const newEnvironment = gateway.environment === "production" ? "sandbox" : "production";
        updatePaymentGateway(gatewayId, { environment: newEnvironment });
        setGateway({ ...gateway, environment: newEnvironment, updatedAt: new Date() });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!gateway) return;

        const validationErrors = validatePaymentGatewayConfig(gateway, gateway.gateway);
        const errorMap = validationErrors.reduce((acc, err, idx) => ({ ...acc, [idx]: err }), {});

        setErrors(errorMap);

        if (validationErrors.length > 0) {
            return;
        }

        setSaving(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        updatePaymentGateway(gatewayId, gateway);

        setSaving(false);
    };

    const handleTestConnection = async () => {
        if (!gateway) return;

        setTestingConnection(true);
        const success = await testPaymentGatewayConnection(gatewayId);
        setConnectionTestResult(success);
        setTestingConnection(false);
    };

    if (!gateway) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                        <RefreshCw className="w-5 h-5 text-gray-500" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Ödeme Yöntemi Düzenle</h1>
                        <p className="text-gray-500 text-sm">{gateway.name} ödeme yöntemini düzenle</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 text-sm font-medium"
                        title="Bağlantı Test Et"
                    >
                        {testingConnection ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Test Ediliyor...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Bağlantı Test Et
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 text-sm"
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
            </div>

            {/* Connection Test Result */}
            {connectionTestResult !== null && (
                <div className={`rounded-xl p-4 mb-8 flex items-center gap-2 text-sm font-medium ${connectionTestResult
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                    }`}>
                    {connectionTestResult ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Bağlantı Başarılı
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-5 h-5" />
                            Bağlantı Başarısız. Lütfen API bilgilerinizi kontrol edin.
                        </>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-6">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi Adı</label>
                                <input
                                    type="text"
                                    value={gateway.name}
                                    onChange={(e) => setGateway({ ...gateway, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea
                                    value={gateway.description}
                                    onChange={(e) => setGateway({ ...gateway, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* API Configuration */}
                    {(gateway.gateway === "paytr" || gateway.gateway === "iyzico" || gateway.gateway === "stripe") && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <Lock className="w-4 h-4 text-gray-600" />
                                </div>
                                <h2 className="font-semibold text-gray-900">API Yapılandırması</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Same fields as create page, relying on state update */}
                                {gateway.gateway === "paytr" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                                            <input type="text" value={gateway.merchantId} onChange={(e) => setGateway({ ...gateway, merchantId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                                <input type="text" value={gateway.apiKey} onChange={(e) => setGateway({ ...gateway, apiKey: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                                                <input type="password" value={gateway.apiSecret} onChange={(e) => setGateway({ ...gateway, apiSecret: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {/* Other gateways... */}
                                {gateway.gateway === "iyzico" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                            <input type="text" value={gateway.apiKey} onChange={(e) => setGateway({ ...gateway, apiKey: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                                            <input type="password" value={gateway.secretKey} onChange={(e) => setGateway({ ...gateway, secretKey: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-3">Durum & Ortam</h3>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <div className="text-gray-500 mb-1">Durum</div>
                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    {gateway.status === "active" ? <span className="text-green-600">Aktif</span> : <span className="text-gray-500">Pasif</span>}
                                </div>
                            </div>
                            <button onClick={handleToggleStatus} className="text-xs font-medium px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200">Değiştir</button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-sm">
                                <div className="text-gray-500 mb-1">Ortam</div>
                                <div className="font-semibold text-gray-900">
                                    {gateway.environment === "production" ? <span className="text-red-600">Canlı Ortam</span> : <span className="text-blue-600">Test Ortamı</span>}
                                </div>
                            </div>
                            <button onClick={handleToggleEnvironment} className="text-xs font-medium px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200">Değiştir</button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Oluşturulma</span>
                            <span className="font-medium">{format(new Date(gateway.createdAt), "dd MMM yyyy", { locale: tr })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Son Güncelleme</span>
                            <span className="font-medium">{format(new Date(gateway.updatedAt), "dd MMM yyyy", { locale: tr })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
