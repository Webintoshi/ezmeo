import { createServerClient } from "@/lib/supabase";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { OrderStatus } from "@/types/order";

// Client Components
import { OrderDetailClient } from "./OrderDetailClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Helper function to get status badge config
function getStatusConfig(status: OrderStatus) {
    const configs: Record<OrderStatus, { label: string; color: string }> = {
        pending: { label: "Beklemede", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
        confirmed: { label: "Onaylandı", color: "bg-blue-50 text-blue-700 border-blue-100" },
        preparing: { label: "Hazırlanıyor", color: "bg-purple-50 text-purple-700 border-purple-100" },
        shipped: { label: "Kargolandı", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
        delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700 border-green-100" },
        cancelled: { label: "İptal", color: "bg-red-50 text-red-700 border-red-100" },
        refunded: { label: "İade", color: "bg-orange-50 text-orange-700 border-orange-100" },
    };
    return configs[status] || configs.pending;
}

export default async function OrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = createServerClient();

    // Fetch order, items, customer, settings, and activity log in parallel
    const [
        orderResponse,
        itemsResponse,
        settingsResponse,
        activityLogResponse,
    ] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).single(),
        supabase
            .from("order_items")
            .select("*, product:products(id, images, category, slug)")
            .eq("order_id", id),
        supabase.from("settings").select("value").eq("key", "payment_gateways").single(),
        supabase
            .from("order_activity_log")
            .select("*")
            .eq("order_id", id)
            .order("created_at", { ascending: false }),
    ]);

    const order = orderResponse.data;
    const items = itemsResponse.data || [];
    const paymentGateways = settingsResponse.data?.value || [];
    const activityLogs = activityLogResponse.data || [];

    if (orderResponse.error || !order) {
        console.error("Error fetching admin order:", orderResponse.error);
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
                <p className="text-gray-500 mb-6">Aradığınız sipariş veritabanında mevcut değil.</p>
                <Link
                    href="/admin/siparisler"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Sipariş Listesine Dön
                </Link>
            </div>
        );
    }

    // Get customer data
    let customer = null;
    let customerOrders = [];
    if (order.customer_id) {
        const [customerResponse, ordersResponse] = await Promise.all([
            supabase.from("customers").select("*").eq("id", order.customer_id).single(),
            supabase
                .from("orders")
                .select("id, order_number, status, total, created_at")
                .eq("customer_id", order.customer_id)
                .neq("id", id)
                .order("created_at", { ascending: false })
                .limit(5),
        ]);
        customer = customerResponse.data;
        customerOrders = ordersResponse.data || [];
    }

    // Determine Payment Method Name
    const gatewayConfig = paymentGateways.find((g: any) => g.id === order.payment_method);
    const paymentMethodName = gatewayConfig
        ? gatewayConfig.name
        : order.payment_method === "cod"
          ? "Kapıda Ödeme"
          : order.payment_method === "bank_transfer"
            ? "Havale / EFT"
            : "Kredi Kartı";

    const statusConfig = getStatusConfig(order.status);

    // Serialize data for client component
    const serializedOrder = {
        ...order,
        created_at: order.created_at?.toString(),
        updated_at: order.updated_at?.toString(),
        estimated_delivery: order.estimated_delivery?.toString(),
    };

    const serializedItems = items.map((item: any) => ({
        ...item,
        created_at: item.created_at?.toString(),
    }));

    const serializedActivityLogs = activityLogs.map((log: any) => ({
        ...log,
        created_at: log.created_at?.toString(),
    }));

    const serializedCustomerOrders = customerOrders.map((o: any) => ({
        ...o,
        created_at: o.created_at?.toString(),
    }));

    return (
        <OrderDetailClient
            order={serializedOrder as any}
            items={serializedItems as any}
            activityLogs={serializedActivityLogs as any}
            customer={customer as any}
            customerOrders={serializedCustomerOrders as any}
            paymentMethodName={paymentMethodName}
            statusConfig={statusConfig}
        />
    );
}
