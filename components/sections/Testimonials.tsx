"use client";

import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { motion } from "framer-motion";

export function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Binlerce mutlu müşterimizin geri bildirimleri. Tadı hiç değişmiyor,
            hep aynı severek yiyorum.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="glass-card p-6 rounded-2xl h-full">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-primary/80 mb-6 line-clamp-4">
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-semibold text-primary">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-800 rounded-full">
            <span className="text-2xl">🌱</span>
            <span className="font-medium">
              vegan.org tarafından onaylı %100 Vegan Ürünler
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
