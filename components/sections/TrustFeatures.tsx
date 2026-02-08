"use client";

import { motion } from "framer-motion";
import { Shield, Award, Heart, Clock, CheckCircle, Sparkles } from "lucide-react";

export function TrustFeatures() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "%100 Doğal",
      description: "Hiçbir katkı maddesi, koruyucu veya yapay aroma içmez. Saf doğal ürün garantisi.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Premium Kalite",
      description: "En iyi tedarikçilerden özenle seçilen kaliteli hammaddelerle üretilir.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Şekersiz Seçenekler",
      description: "Diyetisyen onaylı, şekersiz ve düşük şekerli alternatiflerle sağlıklı yaşam.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Siparişe Özel Üretim",
      description: "Siparişiniz verildiğinde taze olarak üretilir, en kısa sürede kargolanır.",
    },
  ];

  const certificates = [
    { name: "Gıda Güvenliği", icon: <CheckCircle className="w-5 h-5" /> },
    { name: "Helal Sertifikası", icon: <CheckCircle className="w-5 h-5" /> },
    { name: "ISO 9001", icon: <CheckCircle className="w-5 h-5" /> },
    { name: "Organik Tarım", icon: <CheckCircle className="w-5 h-5" /> },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/50 rounded-full blur-3xl"></div>
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
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Neden Biz?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Güvenilirlik ve Kalite
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Müşterilerimizin güvenini kazanmak en büyük önceliğimiz. Her ürünümüz, en yüksek kalite standartlarına uygun üretilir.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-white rounded-3xl p-8 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 premium-card-hover">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-primary mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Sertifikalarımız
            </h3>
            <p className="text-muted">
              Uluslararası standartlara uygun, güvenilir üretim süreçlerimiz
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certificates.map((cert, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl hover:from-primary/10 hover:to-secondary/20 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {cert.icon}
                </div>
                <span className="font-semibold text-primary text-sm text-center">
                  {cert.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
