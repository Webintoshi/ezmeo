"use client";

import { useState } from "react";
import { OrderActivityLog, OrderActivityAction } from "@/types/order";
import { History, ChevronDown, Filter, X } from "lucide-react";

interface OrderActivityLogComponentProps {
  activities: OrderActivityLog[];
  className?: string;
}

const ACTION_LABELS: Record<OrderActivityAction, string> = {
  order_created: "Sipariş oluşturuldu",
  status_changed: "Durum değişti",
  payment_status_changed: "Ödeme durumu değişti",
  shipping_updated: "Kargo bilgisi güncellendi",
  note_added: "Not eklendi",
  note_updated: "Not güncellendi",
  note_deleted: "Not silindi",
  customer_notified: "Müşteriye bildirim gönderildi",
};

const ACTION_ICONS: Record<OrderActivityAction, { icon: string; color: string }> = {
  order_created: { icon: "🟢", color: "bg-emerald-50 text-emerald-600" },
  status_changed: { icon: "🔄", color: "bg-blue-50 text-blue-600" },
  payment_status_changed: { icon: "💳", color: "bg-purple-50 text-purple-600" },
  shipping_updated: { icon: "📦", color: "bg-indigo-50 text-indigo-600" },
  note_added: { icon: "📝", color: "bg-amber-50 text-amber-600" },
  note_updated: { icon: "✏️", color: "bg-amber-50 text-amber-600" },
  note_deleted: { icon: "🗑️", color: "bg-red-50 text-red-600" },
  customer_notified: { icon: "📧", color: "bg-cyan-50 text-cyan-600" },
};

type FilterType = "all" | OrderActivityAction;

// Simple time formatter
function formatTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrderActivityLogComponent({ activities, className = "" }: OrderActivityLogComponentProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredActivities = filter === "all"
    ? activities
    : activities.filter(a => a.action === filter);

  const uniqueActions = Array.from(
    new Set(activities.map(a => a.action))
  ) as OrderActivityAction[];

  const formatActivityDescription = (activity: OrderActivityLog): string => {
    switch (activity.action) {
      case "status_changed":
        return `"${activity.oldValue}" → "${activity.newValue}"`;
      case "payment_status_changed":
        return `"${activity.oldValue}" → "${activity.newValue}"`;
      case "shipping_updated":
        return activity.newValue?.trackingNumber
          ? `Takip No: ${activity.newValue.trackingNumber}`
          : "Kargo bilgisi güncellendi";
      case "note_added":
      case "note_updated":
        return activity.newValue?.text || "";
      case "customer_notified":
        return activity.newValue?.type === "email"
          ? "E-posta gönderildi"
          : "SMS gönderildi";
      default:
        return "";
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
            <History className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Sipariş Geçmişi</h3>
            <p className="text-sm text-gray-500">{activities.length} kayıt</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="p-8">
          {/* Filter */}
          {uniqueActions.length > 1 && (
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="bg-transparent text-sm font-bold text-gray-600 border-0 focus:ring-0 cursor-pointer"
              >
                <option value="all">Tümü</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{ACTION_LABELS[action]}</option>
                ))}
              </select>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          )}

          {/* Activity List */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Bu filtre için kayıt bulunmuyor.</p>
              </div>
            ) : (
              filteredActivities.map((activity, index) => {
                const actionConfig = ACTION_ICONS[activity.action];
                const isLast = index === filteredActivities.length - 1;

                return (
                  <div key={activity.id} className="flex gap-4">
                    {/* Icon & Line */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${actionConfig.color}`}>
                        {actionConfig.icon}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-full bg-gray-100 mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            {ACTION_LABELS[activity.action]}
                          </p>
                          {activity.newValue?.text && (
                            <p className="text-sm text-gray-500 mt-1">
                              {activity.newValue.text}
                            </p>
                          )}
                          {activity.adminName && (
                            <p className="text-xs text-gray-400 mt-1">
                              {activity.adminName}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export as default for easier import
export { OrderActivityLogComponent as OrderActivityLog };
