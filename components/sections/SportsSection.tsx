"use client";

import Link from "next/link";
import { Dumbbell, TrendingUp, Apple } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { ROUTES } from "@/lib/constants";

export function SportsSection() {
  // Şekersiz ve yüksek proteinli ürünler - sporcular için
  const sportsProducts = PRODUCTS.filter(
    (p) => p.sugarFree && p.highProtein
  ).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Dumbbell className="h-4 w-4" />
              Sporculara Özel
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Sporcular Sık Tercih Ediyor
            </h2>
            <p className="text-muted mb-8">
              Yüksek protein, şekersiz ve katkısız. Antrenman öncesi enerji,
              sonrası toparlanma için ideal. Profesyonel sporcuların birinci
              tercihi.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Yüksek Protein</p>
                  <p className="text-xs text-muted">
                    Her serviste 20g+ protein
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Apple className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Doğal Enerji</p>
                  <p className="text-xs text-muted">
                    Sağlıklı karbonhidratlar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Şekersiz</p>
                  <p className="text-xs text-muted">
                    Rafine şeker içermez
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={ROUTES.products}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
            >
              Sporcu Ürünlerini Keşfet
            </Link>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 gap-4">
            {sportsProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
