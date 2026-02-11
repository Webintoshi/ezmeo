"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ROUTES } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types/product";

export function NutsListing() {
    const [nutsProducts, setNutsProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        async function loadNuts() {
            try {
                const { createServerClient } = await import("@/lib/supabase");
                const supabase = createServerClient();
                const { data } = await supabase
                    .from("products")
                    .select("*, variants:product_variants(*)")
                    .eq("category", "kuruyemis")
                    .limit(3);
                
                if (data) setNutsProducts(data);
            } catch (err) {
                console.error("Failed to load nuts products:", err);
            } finally {
                setLoading(false);
            }
        }
        loadNuts();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = sectionRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    // Ürün yoksa section'ı gizle
    if (!loading && nutsProducts.length === 0) return null;

    return (
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/50 rounded-full blur-3xl"></div>
            </div>

            <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Taze & Doğal</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                        Kuruyemişler
                    </h2>
                    <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
                        En kaliteli, taze ve besleyici kuruyemiş çeşitlerimizi keşfedin. Doğrudan kaynağından sofranıza.
                    </p>
                </motion.div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {nutsProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                )}

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <Link
                        href={ROUTES.category("kuruyemis")}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        Tüm Kuruyemişleri Gör
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
