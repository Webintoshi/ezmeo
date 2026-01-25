"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";

export function Categories() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Popüler Ezme Kategorileri
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Her damak tadına uygun, %100 doğal ve katkısız ezmelerimizi keşfedin.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {CATEGORIES.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={ROUTES.category(category.slug)}
                className="group block"
              >
                <div className="glass-card p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-primary mb-1">
                    {category.name}
                  </h3>

                  {/* Product Count */}
                  <p className="text-xs text-muted mb-3">
                    {category.productCount} ürün
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center justify-center text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20 shadow-md hover:shadow-lg"
          >
            Tüm Ürünleri Görüntüle
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
