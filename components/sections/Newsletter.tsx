"use client";

import { Mail, Sparkles, Gift } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-20 md:py-28 premium-gradient text-primary-foreground relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
            <Gift className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Özel Kampanyalar</span>
          </div>

          {/* Icon */}
          <div className="inline-flex p-4 bg-white/20 rounded-full mb-6 animate-float">
            <Mail className="h-10 w-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            E-Bültene Abone Ol, %5 İndirim Kazan!
          </h2>

          {/* Description */}
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Yeni ürünler, özel indirimler ve sağlıklı tarifler için abone olun.
            İlk siparişinizde geçerli %5 indirim kuponunuz hemen e-posta adresinize gönderilecek.
          </p>

          {/* Form */}
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl pulse-glow"
            >
              <Sparkles className="h-5 w-5" />
              Abone Ol
            </button>
          </form>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full"></span>
              Ücretsiz Kupon
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full"></span>
              Yeni Ürünlerden Haberdar Ol
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full"></span>
              Sağlıklı Tarifler
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-sm text-white/60 mt-6 max-w-lg mx-auto">
            KVKK kapsamında kişisel verileriniz korunur ve 3. kişilerle paylaşılmaz. İstediğiniz zaman abonelikten ayrılabilirsiniz.
          </p>
        </div>
      </div>
    </section>
  );
}
