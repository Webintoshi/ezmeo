"use client";

import { useState } from "react";
import { Truck, MapPin, Calendar, MessageSquare, ExternalLink } from "lucide-react";
import { ShippingCarrier, SHIPPING_CARRIERS } from "@/types/order";

interface ShippingInfoCardProps {
  trackingNumber?: string;
  carrier?: ShippingCarrier | string;
  estimatedDelivery?: string | Date;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
  onTrackingUpdate?: (data: { carrier: ShippingCarrier | string; trackingNumber: string }) => Promise<void>;
  onSendSms?: () => void;
  className?: string;
}

export function ShippingInfoCard({
  trackingNumber = "",
  carrier = "",
  estimatedDelivery,
  shippingAddress,
  onTrackingUpdate,
  onSendSms,
  className = "",
}: ShippingInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [trackingInput, setTrackingInput] = useState(trackingNumber);
  const [carrierInput, setCarrierInput] = useState(carrier);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!onTrackingUpdate) return;

    setIsUpdating(true);
    try {
      await onTrackingUpdate({
        carrier: carrierInput,
        trackingNumber: trackingInput,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Kargo bilgisi güncellenirken hata:", error);
      alert("Kargo bilgisi güncellenirken bir hata oluştu.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getTrackingUrl = () => {
    if (!trackingNumber) return null;

    const selectedCarrier = SHIPPING_CARRIERS.find(c => c.id === carrier);
    if (selectedCarrier) {
      return `${selectedCarrier.trackingUrl}${trackingNumber}`;
    }

    // Generic search if carrier not found
    return `https://www.google.com/search?q=${trackingNumber}+kargo+takip`;
  };

  const trackingUrl = getTrackingUrl();

  const calculateEstimatedDelivery = () => {
    if (estimatedDelivery) {
      const date = new Date(estimatedDelivery);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Varsayılan: 2-3 iş günü
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  };

  const estDeliveryDate = calculateEstimatedDelivery();

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-gray-400" />
          Kargo & Teslimat
        </h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Shipping Address */}
        {shippingAddress && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Teslimat Adresi
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-bold text-gray-900 text-sm">
                {shippingAddress.firstName} {shippingAddress.lastName}
              </p>
              <p className="text-gray-600 text-sm mt-1">{shippingAddress.address}</p>
              <p className="text-gray-900 font-medium text-sm mt-0.5">
                {shippingAddress.city} / {shippingAddress.country}
              </p>
              {shippingAddress.phone && (
                <p className="text-xs text-gray-500 mt-1">{shippingAddress.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Tracking Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Kargo Takip
            </p>
            {onTrackingUpdate && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-primary hover:text-red-700"
              >
                Düzenle
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Kargo Firması</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  {SHIPPING_CARRIERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Takip Numarası</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Örn: 1234567890"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isUpdating || !trackingInput}
                  className="flex-1 px-3 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setTrackingInput(trackingNumber);
                    setCarrierInput(carrier);
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Carrier */}
              {carrier && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Kargo</span>
                  <span className="font-bold text-gray-900">
                    {SHIPPING_CARRIERS.find(c => c.id === carrier)?.name || carrier}
                  </span>
                </div>
              )}

              {/* Tracking Number */}
              {trackingNumber ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Takip No</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-900 text-sm">{trackingNumber}</span>
                    {trackingUrl && (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Kargo Takip"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-400">Takip numarası girilmemiş</p>
                </div>
              )}

              {/* Action Buttons */}
              {trackingNumber && (
                <div className="flex gap-2 pt-1">
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Takip Et
                    </a>
                  )}
                  {onSendSms && (
                    <button
                      onClick={onSendSms}
                      className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      SMS
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Estimated Delivery */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Tahmini Teslimat
              </p>
              <p className="font-bold text-gray-900 text-sm">
                {estDeliveryDate.toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
