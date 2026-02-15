
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Leaf, WheatOff, Droplet, Beef, Sprout } from "lucide-react";
import { Product } from "@/types/product";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAllProducts();
        // Filter or sort by best sellers logic (e.g., featured or rating)
        const bestSellers = data.filter(p => p.featured || (p.rating && p.rating > 4.5)).slice(0, 4);
        setProducts(bestSellers);
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
          <h2 className="redesign-title">Best Sellers</h2>
          <Link href={ROUTES.products} className="best-sellers__link">View all products</Link>
        </div>
        
        <div className="best-sellers__grid">
          {products.map((product) => {
            const variant = product.variants?.[0];
            const price = variant?.price || 0;
            const originalPrice = variant?.originalPrice;
            const isSale = originalPrice && originalPrice > price;
            const discount = isSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

            return (
              <div key={product.id} className="best-sellers__card group">
                {isSale && (
                  <span className="best-sellers__badge best-sellers__badge--sale">UP TO -{discount}%</span>
                )}
                {product.new && !isSale && (
                  <span className="best-sellers__badge">NEW</span>
                )}
                
                <Link href={ROUTES.product(product.slug)} className="best-sellers__image-wrapper">
                  <Image
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </Link>
                
                <div className="best-sellers__price-row">
                  <span className="current">From {formatPrice(price)}</span>
                  {isSale && <span className="old">{formatPrice(originalPrice)}</span>}
                </div>
                
                <Link href={ROUTES.product(product.slug)}>
                  <h3 className="best-sellers__title">{product.name}</h3>
                </Link>
                
                <div className="best-sellers__rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill={i < (product.rating || 0) ? "currentColor" : "none"} className={i < (product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                  ))}
                  <span>({product.reviewCount || 0})</span>
                </div>
                
                <p className="best-sellers__desc line-clamp-2">
                  {product.shortDescription || product.description}
                </p>
                
                <div className="best-sellers__actions">
                  <button className="best-sellers__button">
                    Buy now
                  </button>
                  
                  <div className="best-sellers__icons">
                     {/* Icons based on tags or product attributes */}
                     {product.tags?.includes('vegan') && <Leaf strokeWidth={1.5} />}
                     {product.tags?.includes('glutensiz') && <WheatOff strokeWidth={1.5} />}
                     {/* Placeholder icons for design match */}
                     <Droplet strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
