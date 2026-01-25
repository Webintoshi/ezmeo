"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            %100 Doğal, Katkısız Ürünler
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6"
          >
            Doğal Ezmenin En Lezzetli Hali:
            <br />
            <span className="text-accent">Ezmeo&apos;da</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted mb-8 max-w-2xl mx-auto"
          >
            Katkısız, şekersiz ve %100 gerçek kuruyemişlerden üretilmiş fıstık
            ezmesi, fındık ezmesi, badem ezmesi ve daha fazlası Ezmeo&apos;da.
            Sporculara özel yüksek proteinli ezmelerden, çocuklar için sağlıklı
            atıştırmalıklara kadar herkes için doğal bir lezzet var.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={ROUTES.products}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Hemen Keşfet
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={ROUTES.category("findik-ezmeleri")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-all border border-primary/10"
            >
              En Çok Satanlar
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="text-2xl">🌿</span>
              <span>Katkısız</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="text-2xl">💧</span>
              <span>Şeker İlavesiz</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="text-2xl">🌾</span>
              <span>Glutensiz</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="text-2xl">🐰</span>
              <span>Vegan</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="text-2xl">🚀</span>
              <span>Hızlı Kargo</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
    </section>
  );
}
