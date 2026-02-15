
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { getAllProducts } from "@/lib/products";
import { ROUTES } from "@/lib/constants";
import { ProductCard } from "@/components/product/ProductCard";

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAllProducts();
        // Show all active products
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) {
    return <div className="redesign-section"><div className="redesign-container">Loading...</div></div>;
  }

  return (
    <section className="redesign-section" id="best-sellers">
      <div className="redesign-container">
        <div className="best-sellers__header">
          <h2 className="redesign-title">Ürünler</h2>
          <Link href={ROUTES.products} className="best-sellers__link">Tümünü Gör</Link>
        </div>
        
        <div className="best-sellers__grid">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
