"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ComplementaryProductsProps {
  title: string;
  products: Product[];
  loading?: boolean;
}

export function ComplementaryProducts({ title, products, loading }: ComplementaryProductsProps) {
  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="h-6 w-48 bg-gray-100 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <Link 
            href="/urunler" 
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Tümünü Gör
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 4).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
