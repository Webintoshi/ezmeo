"use client";

import { Mail, Sparkles } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex p-3 bg-accent/20 rounded-full mb-6">
            <Mail className="h-8 w-8 text-accent" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            E-Bültene Abone Ol, %5 İndirim Kazan!
          </h2>

          {/* Description */}
          <p className="text-primary-foreground/70 mb-8">
            Siparişi tamamlarken adresinize gönderilen kuponu kullanmayı unutmayın.
            Yeni ürünler, özel indirimler ve sağlıklı tarifler için abone olun.
          </p>

          {/* Form */}
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-white placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              Abone Ol
            </button>
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-primary-foreground/50 mt-4">
            KVKK kapsamında kişisel verileriniz korunur. İstediğiniz zaman abonelikten
            ayrılabilirsiniz.
          </p>
        </div>
      </div>
    </section>
  );
}
