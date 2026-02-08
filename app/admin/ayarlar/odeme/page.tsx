"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Unused import
import {
    getPaymentGateways,
    togglePaymentGatewayStatus,
    deletePaymentGateway,
    duplicatePaymentGateway,
    testPaymentGatewayConnection,
    getPaymentGatewayStats,
} from "@/lib/payments";
import { PaymentGatewayConfig, PaymentMethodStatus, PaymentEnvironment, PaymentGateway } from "@/types/payment";
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    TrendingUp,
    Shield,
    TestTube,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Building2,
    Package,
    DollarSign,
    Zap,
} from "lucide-react";
import Link from "next/link";

export default function PaymentSettingsPage() {
    // const router = useRouter(); // Removed unused router
    const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<PaymentMethodStatus | "all">("all");
    const [testingConnection, setTestingConnection] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, boolean>>({});

    const loadPaymentGateways = () => {
        setLoading(true);
        setPaymentGateways(getPaymentGateways());
        setLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadPaymentGateways();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleToggleStatus = (id: string, currentStatus: PaymentMethodStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        togglePaymentGatewayStatus(id, newStatus);
        loadPaymentGateways();
    };

    const handleDelete = (id: string) => {
        if (confirm("Bu ödeme yöntemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            deletePaymentGateway(id);
            loadPaymentGateways();
        }
    };

    const handleDuplicate = (id: string) => {
        duplicatePaymentGateway(id);
        loadPaymentGateways();
    };

    const handleTestConnection = async (id: string) => {
        setTestingConnection(id);
        const success = await testPaymentGatewayConnection(id);
        setTestResults(prev => ({ ...prev, [id]: success }));
        setTestingConnection(null);
    };

    const filteredGateways = paymentGateways.filter((gateway) => {
        const matchesSearch =
            gateway.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gateway.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || gateway.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = getPaymentGatewayStats();

    const getStatusColor = (status: PaymentMethodStatus) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700 border-green-200";
            case "inactive":
                return "bg-red-100 text-red-700 border-red-200";
            case "test":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusLabel = (status: PaymentMethodStatus) => {
        switch (status) {
            case "active":
                return "Aktif";
            case "inactive":
                return "Pasif";
            case "test":
                return "Test Modu";
            default:
                return status;
        }
    };

    const getEnvironmentColor = (env: PaymentEnvironment) => {
        return env === "production"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700";
    };

    const getGatewayIcon = (gateway: PaymentGateway) => {
        switch (gateway) {
            case "paytr":
                return CreditCard;
            case "iyzico":
                return Building2;
            case "stripe":
                return DollarSign;
            case "bank_transfer":
                return Building2;
            case "cod":
                return Package;
            default:
                return CreditCard;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ödeme Yöntemleri</h1>
                    <p className="text-sm text-gray-500 mt-1">Ödeme gateway&apos;larını yapılandırın ve yönetin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadPaymentGateways}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm text-sm font-medium text-gray-700"
                        title="Yenile"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        href="/admin/ayarlar/odeme/yeni"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Yöntem Ekle
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Toplam Yöntem</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.active}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Aktif</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                            <TestTube className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.testMode}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Test Modu</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.production}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Canlı Ortam</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.sandbox}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Test Ortamı</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ödeme yöntemi ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as PaymentMethodStatus | "all")}
                            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none text-sm cursor-pointer"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Pasif</option>
                            <option value="test">Test Modu</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Payment Gateways Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGateways.map((gateway) => {
                    const GatewayIcon = getGatewayIcon(gateway.gateway);

                    return (
                        <div
                            key={gateway.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <GatewayIcon className="w-6 h-6 text-gray-700" />
                                    </div>
                                    <button
                                        onClick={() => handleToggleStatus(gateway.id, gateway.status)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${gateway.status === "active" ? "bg-green-600" : "bg-gray-200"
                                            }`}
                                    >
                                        <span
                                            className={`${gateway.status === "active" ? "translate-x-6" : "translate-x-1"
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{gateway.name}</h3>
                                    {gateway.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{gateway.description}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(gateway.status)}`}>
                                        {getStatusLabel(gateway.status)}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEnvironmentColor(gateway.environment)}`}>
                                        {gateway.environment === "production" ? "Canlı" : "Test"}
                                    </span>
                                </div>

                                {/* Supported Methods */}
                                <div className="mb-4">
                                    <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Desteklenen Yöntemler</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {gateway.supportedMethods?.map((method) => (
                                            <span
                                                key={method}
                                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200"
                                            >
                                                {method}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Test Result */}
                                {testResults[gateway.id] !== undefined && (
                                    <div className={`p-2 rounded-lg mb-4 text-xs font-medium flex items-center gap-2 ${testResults[gateway.id]
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                        }`}>
                                        {testResults[gateway.id] ? (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Bağlantı Başarılı
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Bağlantı Başarısız
                                            </>
                                        )}
                                    </div>
                                )}

                            </div>

                            <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-2 bg-gray-50/30 rounded-b-xl">
                                <button
                                    onClick={() => handleTestConnection(gateway.id)}
                                    disabled={testingConnection === gateway.id}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium disabled:opacity-50"
                                >
                                    {testingConnection === gateway.id ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Zap className="w-3.5 h-3.5" />
                                    )}
                                    Test Et
                                </button>

                                <Link
                                    href={`/admin/ayarlar/odeme/${gateway.id}/duzenle`}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg hover:bg-gray-800 transition-all text-xs font-medium"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    Düzenle
                                </Link>

                                <button
                                    onClick={() => handleDuplicate(gateway.id)}
                                    className="col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-xs"
                                    title="Kopyala"
                                >
                                    Kopyala
                                </button>

                                <button
                                    onClick={() => handleDelete(gateway.id)}
                                    className="col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-xs"
                                    title="Sil"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Sil
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredGateways.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Ödeme Yöntemi Bulunamadı</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        Henüz ödeme yöntemi yapılandırmadınız. İlk ödeme yönteminizi ekleyerek ödeme alımını başlatın.
                    </p>
                    <Link
                        href="/admin/ayarlar/odeme/yeni"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        İlk Ödeme Yöntemini Ekle
                    </Link>
                </div>
            )}
        </div>
    );
}
