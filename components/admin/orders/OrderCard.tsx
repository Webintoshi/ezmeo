"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import {
  Eye,
  Trash2,
  MoreVertical,
  Printer,
  Mail,
  Copy,
  MessageSquare,
  ChevronDown,
  Check,
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface OrderCardProps {
  order: Order;
  isSelected?: boolean;
  onSelect?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  statusOptions: Array<{ value: string; label: string; color: string }>;
}

export function OrderCard({
  order,
  isSelected = false,
  onSelect,
  onDelete,
  onStatusChange,
  statusOptions,
}: OrderCardProps) {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "preparing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = confirm(
      `"${order.orderNumber}" siparişini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete?.(order.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setIsQuickActionsOpen(false);
  };

  const handleSendEmail = () => {
    window.open(
      `mailto:${order.shippingAddress.email}?subject=Sipariş ${order.orderNumber} Hakkında`,
      "_blank"
    );
    setIsQuickActionsOpen(false);
  };

  const handlePrint = () => {
    window.open(`/admin/siparisler/${order.id}/yazdir`, "_blank");
    setIsQuickActionsOpen(false);
  };

  const quickActions = [
    {
      id: "print",
      label: "Yazdır",
      icon: Printer,
      onClick: handlePrint,
      show: true,
    },
    {
      id: "email",
      label: "E-posta Gönder",
      icon: Mail,
      onClick: handleSendEmail,
      show: !!order.shippingAddress.email,
    },
    {
      id: "copy",
      label: "Sipariş No Kopyala",
      icon: Copy,
      onClick: handleCopyOrderNumber,
      show: true,
    },
    {
      id: "sms",
      label: "SMS Gönder",
      icon: MessageSquare,
      onClick: () => {
        alert("SMS gönderme özelliği yakında eklenecek!");
        setIsQuickActionsOpen(false);
      },
      show: true,
    },
  ];

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(order.id)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        )}

        {/* Order Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Order Number & Date */}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 truncate">
                  {order.orderNumber}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(new Date(order.createdAt))}
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                  statusOptions.find((s) => s.value === order.status)?.color
                }`}
              >
                {getStatusIcon(order.status)}
                {statusOptions.find((s) => s.value === order.status)?.label}
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {/* Total & Items */}
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(order.total)}
                </div>
                <div className="text-sm text-gray-500">
                  {order.items.length} ürün
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sil"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>

              {/* Quick Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isQuickActionsOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsQuickActionsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={action.onClick}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Detail Link */}
              <Link
                href={`/admin/siparisler/${order.id}`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Detay</span>
              </Link>
            </div>
          </div>

          {/* Customer Info & Status Change */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </span>
              <span>•</span>
              <span>{order.shippingAddress.city}</span>
            </div>

            {onStatusChange && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Durum:</label>
                <select
                  value={order.status}
                  onChange={(e) =>
                    onStatusChange(order.id, e.target.value as OrderStatus)
                  }
                  className="text-xs sm:text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {statusOptions
                    .filter((s) => s.value !== "all")
                    .map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Not:</span> {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
