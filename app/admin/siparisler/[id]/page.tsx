
import { createServerClient } from "@/lib/supabase";
import OrderDetailsClient from "@/components/admin/OrderDetailsClient";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();

  try {
    // Fetch Order and Payment Settings in parallel
    const [orderRes, settingsRes] = await Promise.all([
      supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            product:products(category, name)
          )
        `)
        .eq("id", id)
        .single(),
      supabase
        .from("settings")
        .select("value")
        .eq("key", "payment_gateways")
        .single()
    ]);

    const order = orderRes.data;
    const orderError = orderRes.error;
    const paymentGateways = settingsRes.data?.value || [];

    if (orderError || !order) {
      console.error("Admin Order Fetch Error:", orderError);
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
          <p className="text-gray-500 mb-6 max-w-md">
            Aradığınız sipariş veritabanında bulunamadı. Silinmiş olabilir veya ID hatalı olabilir.
          </p>
          <Link
            href="/admin/siparisler"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Siparişlere Dön
          </Link>
        </div>
      );
    }

    return (
      <OrderDetailsClient
        order={order}
        config={{ paymentGateways: paymentGateways }}
      />
    );

  } catch (error) {
    console.error("Admin Order Page Unexpected Error:", error);
    return (
      <div className="p-8 text-center text-red-500">
        Bir hata oluştu. Lütfen konsol loglarını kontrol edin.
      </div>
    );
  }
}
