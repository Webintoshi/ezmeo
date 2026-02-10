"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Printer,
    Download,
} from "lucide-react";
import { OrderStatus, OrderActivityLog as OrderActivityLogType } from "@/types/order";
import {
    OrderStatusSection,
    OrderActivityLog,
    CustomerInfoCard,
    ShippingInfoCard,
    InternalNotes,
    OrderItemsList,
} from "@/components/admin/order-detail";
import "./print.css";

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-black">
                <h1 className="text-2xl font-bold">EZMEO</h1>
                <p className="text-sm mt-1">Sipariş #{order.order_number}</p>
                <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>

            {/* Top Navigation & Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/siparisler"
                        className="p-2 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">
                                #{order.order_number}
                            </h1>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="h-9 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Yazdır</span>
                    </button>
                    <button
                        onClick={() => {
                            // TODO: Implement invoice download
                            alert("Fatura indiriliyor...");
                        }}
                        className="h-9 px-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-red-800 transition-all flex items-center gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Fatura</span>
                    </button>
                </div>
            </div>

            {/* Timeline & Quick Actions - Combined */}
            <OrderStatusSection
                currentStatus={order.status}
                orderId={order.id}
                orderNumber={order.order_number}
                customerEmail={order.shipping_address?.email}
                customerPhone={order.shipping_address?.phone}
                onStatusChange={handleStatusChange}
            />

            {/* Order Items - Full Width */}
            <OrderItemsList
                items={items}
                subtotal={order.subtotal}
                shippingCost={order.shipping_cost}
                discount={order.discount}
                total={order.total}
            />

            {/* Middle Section: 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            id: o.id,
                            orderNumber: o.order_number,
                            status: o.status,
                            total: o.total,
                            createdAt: o.created_at,
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
            </div>

            {/* Bottom Section: Activity Log & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Activity Log */}
                <OrderActivityLog activities={formattedLogs} />

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

            {/* Print Footer - Only visible when printing */}
            <div className="hidden print:block text-center mt-6 pt-4 border-t border-gray-300 text-xs text-gray-500">
                <p>EZMEO - Doğal ve Sağlıklı Ürünler | www.ezmeo.com</p>
                <p>Bu belge bilgisayar ortamında otomatik olarak üretilmiştir.</p>
            </div>
        </div>
    );
}
