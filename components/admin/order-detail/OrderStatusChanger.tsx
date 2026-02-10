"use client";

import { useState } from "react";
import { OrderStatus, ORDER_STATUS_CONFIG } from "@/types/order";
import { ChevronDown, Check } from "lucide-react";

interface OrderStatusChangerProps {
  currentStatus: OrderStatus;
  onStatusChange: (newStatus: OrderStatus) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function OrderStatusChanger({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = "",
}: OrderStatusChangerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentConfig = ORDER_STATUS_CONFIG[currentStatus];

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    // Critical operations için confirmation
    if (newStatus === "cancelled" || newStatus === "refunded") {
      const confirmed = confirm(
        `Bu siparişi ${newStatus === "cancelled" ? "iptal" : "iade"} etmek istediğinizden emin misiniz?`
      );
      if (!confirmed) return;
    }

    setIsUpdating(true);
    setIsOpen(false);

    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error("Durum güncellenirken hata:", error);
      alert("Durum güncellenirken bir hata oluştu.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm
          transition-all duration-200
          ${disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
          }
          ${isUpdating ? "opacity-50" : ""}
        `}
      >
        <span className={`w-2 h-2 rounded-full ${
          currentStatus === "cancelled" ? "bg-red-500" :
          currentStatus === "refunded" ? "bg-orange-500" :
          "bg-emerald-500"
        }`} />
        <span>{currentConfig?.label || "Bilinmiyor"}</span>
        {!disabled && (
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Sipariş Durumu
              </p>
            </div>

            {STATUS_OPTIONS.map((status) => {
              const config = ORDER_STATUS_CONFIG[status];
              const isSelected = status === currentStatus;

              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-colors duration-150
                    ${isSelected
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50"
                    }
                    ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${
                        status === "cancelled" ? "bg-red-500" :
                        status === "refunded" ? "bg-orange-500" :
                        "bg-gray-400"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{config?.label}</p>
                    <p className="text-xs opacity-70">{config?.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
