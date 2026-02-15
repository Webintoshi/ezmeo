
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Shield, Check, Truck, Clock, Sparkles, Mail, Send, Instagram, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Marquee } from "../Marquee";

// Types from PremiumHome
interface HeroSlide {
  id: number;
  desktop: string;
  mobile: string;
  alt: string;
  link?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function HeroSection({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (slides.length > 0) {
      setIsLoaded(true);
    }
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (!isLoaded || slides.length === 0) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] bg-gradient-to-br from-red-50 via-white to-red-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%237B1113%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034h-2v-2h-2v2h-4v2h4v2h2v-2h4v-2zm-6-6h-2v-2h-2v2h-4v2h4v2h2v-2h4v-2zm-6-6h-2v-2h-2v2h-4v2h4v2h2v-2h4v-2zM36%2022h-2v-2h-2v2h-4v2h4v2h2v-2h4v-2zm-6-6h-2v-2h-2v2h-4v2h4v2h2v-2h4v-2zm-6-6h-2v-2h-2v2h-4v2h4v2h2v-2h4v-2z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-full mb-6">
                Yeni Sezon
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                Doğal <span className="text-red-700">Fıstık</span> Ezmesi
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                %100 doğal, katkısız ve organik. En taze fıstık ezmesi çeşitleri kapınızda.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={ROUTES.products}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-700 text-white font-semibold rounded-full hover:bg-red-800 transition-all hover:scale-105 hover:shadow-xl"
                >
                  Ürünleri Keşfet
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/hakkimizda"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-50 transition-all border border-gray-200"
                >
                  Detaylı Bilgi
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative h-[60vh] md:h-[75vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.desktop}
            alt={slide.alt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-xl md:max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {slide.title && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6"
                >
                  {slide.title}
                </motion.span>
              )}
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                {slide.alt}
              </h2>
              {slide.subtitle && (
                <p className="text-lg md:text-xl text-white/90 mb-8">
                  {slide.subtitle}
                </p>
              )}
              {slide.buttonText && (
                <Link
                  href={slide.buttonLink || ROUTES.products}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all hover:scale-105"
                >
                  {slide.buttonText}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                idx === current ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
}

export function MarqueeSection() {
  return <Marquee />;
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 1000);
  };

  return (
    <section className="py-16 md:py-24 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium text-sm uppercase tracking-wider">Bülten</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Özel Fırsatlardan Haber Olun
          </h2>
          <p className="text-gray-400 mb-8">
            İlk siparişinizde <span className="text-white font-bold">%10 indirim</span> kazanın! E-posta listemize abone olun.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-6"
            >
              <Check className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-white font-medium">Teşekkürler! %10 indirim kazandınız.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Abone Ol <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
          
          <p className="text-xs text-gray-500 mt-4">
            Dilediğiniz zaman abonelikten çıkabilirsiniz.
          </p>
        </div>
      </div>
    </section>
  );
}

export function InstagramFeed() {
  const posts = [
    { id: 1, image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400", alt: "Post 1" },
    { id: 2, image: "https://images.unsplash.com/photo-1599599810769-bcde5a45dd03?w=400", alt: "Post 2" },
    { id: 3, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400", alt: "Post 3" },
    { id: 4, image: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400", alt: "Post 4" },
    { id: 5, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400", alt: "Post 5" },
    { id: 6, image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400", alt: "Post 6" },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Instagram className="w-5 h-5 text-pink-600" />
            <span className="text-pink-600 font-medium text-sm uppercase tracking-wider">Instagram</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">@ezmeo</h2>
          <p className="text-gray-500">Takip edin, lezzetli anları kaçırmayın</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          {posts.map((post, idx) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/ezmeo"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://instagram.com/ezmeo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Instagram className="w-5 h-5" />
            Takip Et
          </a>
        </div>
      </div>
    </section>
  );
}
