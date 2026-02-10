"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Printer,
    Download,
    CreditCard,
    CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { OrderStatus, OrderActivityLog as OrderActivityLogType } from "@/types/order";
import {
    OrderTimeline,
    OrderStatusChanger,
    QuickActions,
    OrderActivityLog,
    CustomerInfoCard,
    ShippingInfoCard,
    InternalNotes,
    OrderItemsList,
} from "@/components/admin/order-detail";

interface Order {
    id: string;
    order_number: string;
    status: OrderStatus;
    payment_method: string;
    payment_status: string;
    subtotal: number;
    shipping_cost: number;
    discount: number;
    total: number;
    notes?: string;
    internal_notes?: string;
    shipping_carrier?: string;
    tracking_number?: string;
    estimated_delivery?: string;
    shipping_address?: {
        firstName?: string;
        lastName?: string;
        address?: string;
        city?: string;
        country?: string;
        phone?: string;
        email?: string;
    };
    billing_address?: any;
    created_at: string;
    updated_at: string;
}

interface OrderItem {
    id: string;
    product_name: string;
    variant_name?: string;
    price: number;
    quantity: number;
    total: number;
    product?: {
        id?: string;
        images?: string[];
        category?: string;
        slug?: string;
    };
}

interface Customer {
    id: string;
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    total_orders?: number;
    total_spent?: number;
}

interface CustomerOrder {
    id: string;
    order_number: string;
    status: string;
    total: number;
    created_at: string;
}

interface OrderDetailClientProps {
    order: Order;
    items: OrderItem[];
    activityLogs: OrderActivityLogType[];
    customer: Customer | null;
    customerOrders: CustomerOrder[];
    paymentMethodName: string;
    statusConfig: { label: string; color: string };
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: "Beklemede", color: "bg-amber-50 text-amber-600" },
    processing: { label: "İşleniyor", color: "bg-blue-50 text-blue-600" },
    completed: { label: "Tamamlandı", color: "bg-emerald-50 text-emerald-600" },
    failed: { label: "Hata", color: "bg-red-50 text-red-600" },
    refunded: { label: "İade Edildi", color: "bg-orange-50 text-orange-600" },
};

export function OrderDetailClient({
    order,
    items,
    activityLogs,
    customer,
    customerOrders,
    paymentMethodName,
    statusConfig,
}: OrderDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [notes, setNotes] = useState(
        activityLogs.filter(
            (log) => log.action === "note_added" || log.action === "note_updated"
        )
    );
    const [logs, setLogs] = useState<OrderActivityLogType[]>(activityLogs);

    // Format activity logs for display
    const formattedLogs = logs.map((log) => ({
        ...log,
        adminName: log.adminName || "Admin",
    }));

    // Handle status change
    const handleStatusChange = async (newStatus: OrderStatus) => {
        const response = await fetch(`/api/admin/orders/${order.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
            // Add new activity log
            const newLog: OrderActivityLogType = {
                id: crypto.randomUUID(),
                orderId: order.id,
                action: "status_changed",
                oldValue: order.status,
                newValue: newStatus,
                adminName: "Admin",
                createdAt: new Date(),
            };
            setLogs([newLog, ...logs]);

            // Refresh page data
            startTransition(() => {
                router.refresh();
            });
        }
    };

    // Handle tracking update
    const handleTrackingUpdate = async (data: { carrier: string; trackingNumber: string }) => {
        const response = await fetch(`/api/admin/orders/${order.id}/shipping`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const newLog: OrderActivityLogType = {
                id: crypto.randomUUID(),
                orderId: order.id,
                action: "shipping_updated",
                newValue: data,
                adminName: "Admin",
                createdAt: new Date(),
            };
            setLogs([newLog, ...logs]);

            startTransition(() => {
                router.refresh();
            });
        }
    };

    // Handle note add
    const handleAddNote = async (text: string) => {
        const response = await fetch(`/api/admin/orders/${order.id}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, adminName: "Admin" }),
        });

        if (response.ok) {
            const { activityLog } = await response.json();
            const newLog: OrderActivityLogType = {
                ...activityLog,
                orderId: order.id,
                adminName: "Admin",
                createdAt: new Date(activityLog.createdAt),
            };
            setNotes([newLog, ...notes]);
            setLogs([newLog, ...logs]);
        }
    };

    // Handle note update
    const handleUpdateNote = async (noteId: string, text: string) => {
        const response = await fetch(`/api/admin/orders/${order.id}/notes`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId, text }),
        });

        if (response.ok) {
            setNotes(
                notes.map((n) =>
                    n.id === noteId
                        ? { ...n, newValue: { text } }
                        : n
                )
            );
        }
    };

    // Handle note delete
    const handleDeleteNote = async (noteId: string) => {
        const response = await fetch(`/api/admin/orders/${order.id}/notes?noteId=${noteId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            setNotes(notes.filter((n) => n.id !== noteId));
        }
    };

    const formattedDate = new Date(order.created_at).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.pending;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Navigation & Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/siparisler"
                        className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                #{order.order_number}
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="h-10 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Yazdır
                    </button>
                    <button
                        onClick={() => {
                            // TODO: Implement invoice download
                            alert("Fatura indiriliyor...");
                        }}
                        className="h-10 px-4 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-red-800 transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Fatura
                    </button>
                </div>
            </div>

            {/* Timeline & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <OrderTimeline currentStatus={order.status} />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500">Durumu Değiştir</span>
                    </div>
                    <OrderStatusChanger
                        currentStatus={order.status}
                        onStatusChange={handleStatusChange}
                    />
                    <QuickActions
                        orderId={order.id}
                        orderNumber={order.order_number}
                        customerEmail={order.shipping_address?.email}
                        customerPhone={order.shipping_address?.phone}
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Items & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items */}
                    <OrderItemsList
                        items={items}
                        subtotal={order.subtotal}
                        shippingCost={order.shipping_cost}
                        discount={order.discount}
                        total={order.total}
                    />

                    {/* Activity Log */}
                    <OrderActivityLog
                        activities={formattedLogs}
                    />
                </div>

                {/* Right Column: Customer, Shipping, Notes */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    {customer && (
                        <CustomerInfoCard
                            customer={{
                                id: customer.id,
                                firstName: customer.first_name,
                                lastName: customer.last_name,
                                email: customer.email,
                                phone: customer.phone,
                                totalOrders: customer.total_orders,
                                totalSpent: customer.total_spent,
                            }}
                            customerOrders={customerOrders.map((o) => ({
                                ...o,
                                createdAt: new Date(o.created_at),
                            }))}
                        />
                    )}

                    {/* Shipping Info */}
                    <ShippingInfoCard
                        trackingNumber={order.tracking_number}
                        carrier={order.shipping_carrier}
                        estimatedDelivery={order.estimated_delivery}
                        shippingAddress={order.shipping_address}
                        onTrackingUpdate={handleTrackingUpdate}
                    />

                    {/* Payment Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            Ödeme Bilgileri
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Ödeme Yöntemi
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        {order.payment_method === "cod" ? (
                                            <span className="text-lg">🚚</span>
                                        ) : order.payment_method === "bank_transfer" ? (
                                            <span className="text-lg">🏦</span>
                                        ) : (
                                            <span className="text-lg">💳</span>
                                        )}
                                    </div>
                                    <span className="font-black text-gray-900">{paymentMethodName}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Ödeme Durumu
                                </p>
                                <div
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${paymentStatusConfig.color}`}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            order.payment_status === "completed"
                                                ? "bg-emerald-500"
                                                : order.payment_status === "failed"
                                                  ? "bg-red-500"
                                                  : "bg-amber-500"
                                        }`}
                                    />
                                    {paymentStatusConfig.label}
                                </div>
                            </div>

                            {order.payment_status === "completed" && (
                                <button
                                    onClick={() => {
                                        // TODO: Show receipt modal
                                        alert("Makbuz gösteriliyor...");
                                    }}
                                    className="w-full mt-4 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Makbuz Göster
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <InternalNotes
                        notes={notes.map((n) => ({
                            id: n.id,
                            text: n.newValue?.text || "",
                            adminName: n.adminName,
                            createdAt: new Date(n.createdAt),
                        }))}
                        customerNote={order.notes}
                        onAddNote={handleAddNote}
                        onUpdateNote={handleUpdateNote}
                        onDeleteNote={handleDeleteNote}
                        currentAdminName="Admin"
                    />
                </div>
            </div>
        </div>
    );
}
