"use client";

import { useState, useRef, useEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentConfig = ORDER_STATUS_CONFIG[currentStatus];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    // Critical operations için confirmation
    if (newStatus === "cancelled" || newStatus === "refunded") {
      const confirmed = confirm(
        `Bu siparişi ${newStatus === "cancelled" ? "iptal" : "iade"} etmek istediğinizden emin misiniz?`
      );
      if (!confirmed) {
        setIsOpen(false);
        return;
      }
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

  const toggleDropdown = () => {
    if (!disabled && !isUpdating) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        disabled={disabled || isUpdating}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm
          transition-all duration-200 border-2
          ${disabled || isUpdating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-transparent"
            : isOpen
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
              : "bg-white border-gray-200 text-gray-700 hover:border-primary hover:shadow-md cursor-pointer"
          }
        `}
      >
        <span className={`w-2 h-2 rounded-full ${
          currentStatus === "cancelled" ? "bg-red-400" :
          currentStatus === "refunded" ? "bg-orange-400" :
          currentStatus === "delivered" ? "bg-emerald-400" :
          "bg-emerald-400"
        } ${isOpen ? "bg-white" : ""}`} />
        <span>{currentConfig?.label || "Bilinmiyor"}</span>
        {!disabled && (
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div 
          className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[9999] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
          style={{ 
            boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sipariş Durumunu Değiştir
            </p>
          </div>

          <div className="max-h-[320px] overflow-y-auto py-1">
            {STATUS_OPTIONS.map((status) => {
              const config = ORDER_STATUS_CONFIG[status];
              const isSelected = status === currentStatus;
              const isNegative = status === "cancelled" || status === "refunded";

              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-all duration-150
                    ${isSelected
                      ? "bg-emerald-50 text-emerald-700"
                      : isNegative
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                    ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-600"
                      : isNegative
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-500"
                  }`}>
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${
                        status === "cancelled" ? "bg-red-500" :
                        status === "refunded" ? "bg-orange-500" :
                        status === "delivered" ? "bg-emerald-500" :
                        "bg-gray-400"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{config?.label}</p>
                    <p className="text-xs opacity-70 truncate">{config?.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
