"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Fıstık Ezmesi",
    slug: "fistik-ezmesi",
    image: "https://images.unsplash.com/photo-1612187715474-5e78a3728a1a?w=600&h=400&fit=crop",
    count: 12,
    color: "from-amber-600 to-orange-700"
  },
  {
    name: "Fındık Ezmesi",
    slug: "findik-ezmesi",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a1645f7?w=600&h=400&fit=crop",
    count: 8,
    color: "from-amber-700 to-yellow-800"
  },
  {
    name: "Kuruyemiş",
    slug: "kuruyemis",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=400&fit=crop",
    count: 15,
    color: "from-amber-800 to-yellow-900"
  }
];

export function CategoryShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Kategoriler
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Lezzet Kategorileri
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Size özel hazırlanmış doğal ezmelerimizi ve kuruyemişlerimizi keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category.slug}
              href={`/urunler?category=${category.slug}`}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] md:aspect-auto"
            >
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className={`inline-block w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">
                    {category.slug === "fistik-ezmesi" && "🥜"}
                    {category.slug === "findik-ezmesi" && "🌰"}
                    {category.slug === "kuruyemis" && "�"}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-white/80 mb-4">
                  {category.count} ürün
                </p>

                <div className="flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                  <span>Keşfet</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
