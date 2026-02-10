"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus, PaymentStatus } from "@/types/order";
import {
  Search,
  ChevronDown,
} from "lucide-react";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { OrderBulkActions } from "@/components/admin/orders/OrderBulkActions";
import { OrderPagination } from "@/components/admin/orders/OrderPagination";
import { OrderSort } from "@/components/admin/orders/OrderSort";
import { OrderExport } from "@/components/admin/orders/OrderExport";

// Transform database order to frontend format
function transformOrder(dbOrder: Record<string, unknown>): Order {
  return {
    id: dbOrder.id as string,
    orderNumber: dbOrder.order_number as string,
    items: ((dbOrder.items as Record<string, unknown>[]) || []).map(item => ({
      productId: item.product_id as string,
      variantId: item.variant_id as string,
      productName: item.product_name as string,
      variantName: item.variant_name as string,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      total: Number(item.total) || (Number(item.price) * Number(item.quantity)) || 0,
    })),
    subtotal: Number(dbOrder.subtotal) || 0,
    shippingCost: Number(dbOrder.shipping_cost) || 0,
    discount: Number(dbOrder.discount) || 0,
    total: Number(dbOrder.total) || 0,
    status: (dbOrder.status as OrderStatus) || "pending",
    paymentStatus: (dbOrder.payment_status as PaymentStatus) || "pending",
    paymentMethod: ((dbOrder.payment_method as string) || "card") as Order["paymentMethod"],
    shippingAddress: (dbOrder.shipping_address as Order["shippingAddress"]) || {
      firstName: "", lastName: "", phone: "", email: "",
      address: "", city: "", district: "", postalCode: ""
    },
    createdAt: new Date(dbOrder.created_at as string),
    updatedAt: new Date(dbOrder.updated_at as string),
  };
}

type SortOption = "date-desc" | "date-asc" | "total-desc" | "total-asc";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const ITEMS_PER_PAGE = 20;

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders.map(transformOrder));
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Apply filters, search, and sorting
  const processedOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress.lastName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "total-desc":
          return b.total - a.total;
        case "total-asc":
          return a.total - b.total;
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = processedOrders.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const statusOptions = [
    { value: "all", label: "Tümü", color: "bg-gray-100 text-gray-700" },
    { value: "pending", label: "Beklemede", color: "bg-yellow-50 text-yellow-700" },
    { value: "confirmed", label: "Onaylandı", color: "bg-blue-50 text-blue-700" },
    { value: "preparing", label: "Hazırlanıyor", color: "bg-purple-50 text-purple-700" },
    { value: "shipped", label: "Kargolandı", color: "bg-indigo-50 text-indigo-700" },
    { value: "delivered", label: "Teslim Edildi", color: "bg-green-50 text-green-700" },
    { value: "cancelled", label: "İptal", color: "bg-red-50 text-red-700" },
    { value: "refunded", label: "İade", color: "bg-orange-50 text-orange-700" },
  ];

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      await loadOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadOrders();
      } else {
        const error = await res.json();
        alert(error.error || "Sipariş silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Sipariş silinirken bir hata oluştu.");
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map((o) => o.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = confirm(
      `${selectedIds.size} siparişi silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/orders?id=${id}`, { method: "DELETE" })
        )
      );
      setSelectedIds(new Set());
      await loadOrders();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
      alert("Toplu silme işlemi başarısız oldu.");
    }
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch("/api/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus }),
          })
        )
      );
      setSelectedIds(new Set());
      await loadOrders();
    } catch (error) {
      console.error("Failed to bulk update status:", error);
      alert("Toplu durum güncelleme başarısız oldu.");
    }
  };

  const isAllSelected = paginatedOrders.length > 0 && selectedIds.size === paginatedOrders.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
        <OrderExport orders={processedOrders} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Sipariş numarası veya müşteri ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0); // Reset to first page on search
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0); // Reset to first page on filter
                }}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <OrderSort currentSort={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="p-4 border-b border-gray-200">
          <OrderBulkActions
            selectedCount={selectedIds.size}
            totalCount={processedOrders.length}
            onBulkDelete={handleBulkDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedIds(new Set())}
            isAllSelected={isAllSelected}
          />
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p>Yükleniyor...</p>
            </div>
          ) : paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedIds.has(order.id)}
                onSelect={handleSelectOrder}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                statusOptions={statusOptions}
              />
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "Arama kriterlerinize uygun sipariş bulunamadı."
                : "Henüz sipariş bulunmuyor."}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && processedOrders.length > 0 && (
          <OrderPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={processedOrders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
