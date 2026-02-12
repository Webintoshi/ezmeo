"use client";

import { motion } from "framer-motion";
import { Truck, Leaf, Clock, Shield, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUST_BADGES = [
  {
    id: "free-shipping",
    icon: Truck,
    title: "Ücretsiz Kargo",
    description: "100₺ üzeri",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "organic",
    icon: Leaf,
    title: "%100 Organik",
    description: "Doğal & Katkısız",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "same-day",
    icon: Clock,
    title: "Aynı Gün Kargo",
    description: "15:00'e kadar",
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "secure",
    icon: Shield,
    title: "Güvenli Ödeme",
    description: "256-bit SSL",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "return",
    icon: RotateCcw,
    title: "Kolay İade",
    description: "14 gün içinde",
    color: "from-rose-500 to-rose-600",
  },
];

export function TrustBadges() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {TRUST_BADGES.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md mb-3",
                  "group-hover:scale-110 group-hover:shadow-lg transition-all duration-300",
                  badge.color
                )}
              >
                <badge.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5">
                {badge.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
