"use client";

import { Leaf, Factory, Truck, Shield, Heart, Gift } from "lucide-react";

const FEATURES = [
  {
    icon: <Leaf className="w-10 h-10" />,
    title: "Doğal Malzemeler",
    description: "Sadece en kaliteli ve doğal malzemeleri kullanıyoruz. Hiçbir katkı maddesi içermez.",
    highlight: " Organik"
  },
  {
    icon: <Factory className="w-10 h-10" />,
    title: "Siparişte Üretim",
    description: "Tüm ürünlerimiz sipariş üzerine taze olarak üretilir. Stokta bekleyen ürün yok!",
    highlight: " Taze"
  },
  {
    icon: <Truck className="w-10 h-10" />,
    title: "Hızlı Kargo",
    description: "Siparişiniz aynı gün içinde kargoya verilir. 24-48 saat içinde kapınızda!",
    highlight: " Hızlı"
  },
  {
    icon: <Shield className="w-10 h-10" />,
    title: "Kalite Garantisi",
    description: "Tüm ürünlerimiz gıda güvenliği standartlarına uygun olarak üretilir ve paketlenir.",
    highlight: " Güvenli"
  },
  {
    icon: <Heart className="w-10 h-10" />,
    title: "Müşteri Memnuniyeti",
    description: "4.9/5 puan alan müşteri memnuniyetimiz, kalitemizin en büyük kanıtıdır.",
    highlight: " Memnun"
  },
  {
    icon: <Gift className="w-10 h-10" />,
    title: "Özel Paketleme",
    description: "Ürünleriniz özenle paketlenir, taze kalitesiyle kapınıza kadar ulaşır.",
    highlight: " Özel"
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Neden Ezmeo?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Farkımız
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sizin için en iyisini sunuyoruz. İşte Ezmeo'yu özel kılan 6 neden
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-3xl border border-gray-100 hover:border-primary/20 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>

              <div className="mb-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {feature.highlight}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
