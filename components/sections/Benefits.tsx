"use client";

import { motion } from "framer-motion";
import { Zap, Leaf, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export function Benefits() {
  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Enerji Verici",
      description: "Doğal protein ve sağlıklı yağlar sayesinde gün boyu enerjinizi koruyun.",
      stats: "100+g protein",
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Doğal ve Sağlıklı",
      description: "Hiçbir katkı maddesi içermeyen, tamamen doğal ürünler.",
      stats: "%100 doğal",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Aile Arkadaş",
      description: "Binlerce mutlu müşteri ve güvenilir satış ağı.",
      stats: "5000+ müşteri",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performans Artışı",
      description: "Sporcular ve fitness tutkunları için ideal beslenme desteği.",
      stats: "%98 memnuniyet",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/50 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary">Faydalar</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Neden Ezmeo?
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Doğal ezmelerimizin sağlığınıza ve yaşam kalitenize kattığı değerleri keşfedin.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="premium-card-hover bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 h-full shadow-lg border border-gray-100 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Stats Badge */}
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary">
                    {benefit.stats}
                  </span>
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                    {benefit.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-primary mb-3">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/10 rounded-3xl p-8 md:p-12 border border-primary/10">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Sağlıklı Yaşama Adım Atın
            </h3>
            <p className="text-muted mb-8 leading-relaxed">
              Ezmeo&apos;nun %100 doğal ezmeleriyle sağlıklı beslenme alışkanlıklarınızı geliştirin.
              İlk siparişinizde geçerli %5 indirimden yararlanın.
            </p>
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 premium-gradient text-white rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Ürünleri İncele
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
