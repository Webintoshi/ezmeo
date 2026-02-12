"use client";

import { Star, Quote, TrendingUp, Users, Award, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TestimonialWithPhoto {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
  photoUrl?: string;
  verified: boolean;
}

const ENHANCED_TESTIMONIALS: TestimonialWithPhoto[] = TESTIMONIALS.map((t, i) => ({
  ...t,
  verified: true,
  photoUrl: `/testimonial-${i + 1}.jpg`,
}));

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ENHANCED_TESTIMONIALS.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % ENHANCED_TESTIMONIALS.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + ENHANCED_TESTIMONIALS.length) % ENHANCED_TESTIMONIALS.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div ref={containerRef} className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-100"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">5,000+</div>
            <div className="text-sm text-gray-600 font-medium">Mutlu Müşteri</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-100"
          >
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">4.9/5</div>
            <div className="text-sm text-gray-600 font-medium">Ortalama Puan</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-100"
          >
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">98%</div>
            <div className="text-sm text-gray-600 font-medium">Memnuniyet</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-100"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-7 h-7 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">1,200+</div>
            <div className="text-sm text-gray-600 font-medium">Yorum</div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Müşteri Yorumları</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Binlerce mutlu müşterimizin deneyimlerini keşfedin
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-br from-primary to-primary/90 rounded-[2rem] p-8 md:p-16 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-8">
                    <Quote className="w-12 h-12 text-white/20 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-6 h-6 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl font-medium text-white leading-relaxed"
                      >
                        &ldquo;{ENHANCED_TESTIMONIALS[activeIndex].text}&rdquo;
                      </motion.p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                        {ENHANCED_TESTIMONIALS[activeIndex].name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold text-white">
                            {ENHANCED_TESTIMONIALS[activeIndex].name}
                          </p>
                          {ENHANCED_TESTIMONIALS[activeIndex].verified && (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <p className="text-white/70">
                          {ENHANCED_TESTIMONIALS[activeIndex].role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevSlide}
                        className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Önceki"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Sonraki"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </motion.div>

                  <div className="flex gap-2 mt-8">
                    {ENHANCED_TESTIMONIALS.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          index === activeIndex ? "w-12 bg-white" : "w-3 bg-white/30 hover:bg-white/50"
                        )}
                        aria-label={`Yorum ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {ENHANCED_TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => goToSlide(index)}
                className={cn(
                  "cursor-pointer group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2",
                  index === activeIndex ? "border-primary" : "border-transparent hover:border-primary/20"
                )}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />

                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="w-12 h-12 text-primary" />
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-5 text-sm leading-relaxed line-clamp-3">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-900 text-sm">
                        {testimonial.name}
                      </p>
                      {testimonial.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-20 pt-12 border-t border-gray-200"
          >
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-gray-300" />
                <p className="text-gray-400 font-medium tracking-widest uppercase text-xs md:text-sm whitespace-nowrap">
                  Güvenilir Platformlarda Ezmeo
                </p>
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-gray-300" />
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 lg:gap-16">
                {[
                  { name: "Google", color: "text-blue-500" },
                  { name: "Trustpilot", color: "text-emerald-500" },
                  { name: "Trendyol", color: "text-orange-500" },
                  { name: "Hepsiburada", color: "text-orange-600" },
                ].map((brand) => (
                  <motion.div
                    key={brand.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.5 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-primary/20 transition-all duration-300">
                      <span className={cn(
                        "text-xl md:text-2xl font-black tracking-tighter transition-colors duration-300",
                        "text-gray-400 group-hover:text-primary"
                      )}>
                        {brand.name}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
