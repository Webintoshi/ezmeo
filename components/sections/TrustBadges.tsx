"use client";

import { ShieldCheck, Truck, Leaf, Heart, Award, RefreshCw } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "%100 Doğal",
    description: "Katkısız ve katkı maddesiz",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: "Aynı Gün Kargo",
    description: "Siparişiniz aynı gün kargoda",
    color: "from-blue-500 to-cyan-600"
  },
  {
    icon: <Leaf className="w-8 h-8" />,
    title: "Taze Üretim",
    description: "Siparişte üretim",
    color: "from-emerald-500 to-teal-600"
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Müşteri Memnuniyeti",
    description: "4.9/5 puan",
    color: "from-pink-500 to-rose-600"
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Kalite Belgeli",
    description: "Gıda güvenliği sertifikalı",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: "Kolay İade",
    description: "30 gün koşulsuz iade",
    color: "from-purple-500 to-violet-600"
  }
];

export function TrustBadges() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {TRUST_ITEMS.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
