"use client";

import * as React from "react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { X, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickViewContextType {
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const QuickViewContext = React.createContext<QuickViewContextType>({
  quickViewProduct: null,
  setQuickViewProduct: () => {},
});

export function useQuickView() {
  return React.useContext(QuickViewContext);
}

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

  return (
    <QuickViewContext.Provider value={{ quickViewProduct, setQuickViewProduct }}>
      {children}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </QuickViewContext.Provider>
  );
}

function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {product.category === "fistik-ezmesi" && "🥜"}
                {product.category === "findik-ezmesi" && "🌰"}
                {product.category === "kuruyemis" && "🥔"}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < Math.round(product.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviewCount || 0} değerlendirme)</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">{product.shortDescription || product.description}</p>
            
            {/* Variants */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Seçenekler</p>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-sm"
                  >
                    {variant.name} - {formatPrice(variant.price)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.variants?.[0]?.price || 0)}
                </span>
                {product.variants?.[0]?.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.variants[0].originalPrice)}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Link
                  href={`/urun/${product.slug}`}
                  className="flex-1 px-6 py-3 bg-primary text-white text-center font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ürünü İncele
                </Link>
                <button className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
