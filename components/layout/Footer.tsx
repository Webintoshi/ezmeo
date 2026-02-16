"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Instagram, 
  Send,
  ArrowRight,
  Heart,
  Package,
  Sparkles,
  Shield,
  Truck
} from "lucide-react";
import { SITE_NAME, CONTACT_INFO, SOCIAL_LINKS } from "@/lib/constants";
import { useStoreInfo } from "@/lib/store-info-context";

export function Footer() {
  const { storeInfo } = useStoreInfo();
  const currentYear = new Date().getFullYear();

  const contactInfo = storeInfo ? {
    email: storeInfo.email || CONTACT_INFO.email,
    phone: storeInfo.phone || CONTACT_INFO.phone,
    address: storeInfo.address || CONTACT_INFO.address,
  } : CONTACT_INFO;

  const socialLinks = storeInfo ? {
    instagram: storeInfo.socialInstagram || SOCIAL_LINKS.instagram,
    facebook: SOCIAL_LINKS.facebook,
    twitter: storeInfo.socialTwitter || SOCIAL_LINKS.twitter,
  } : SOCIAL_LINKS;

  const footerLinks = {
    products: [
      { name: "Tüm Ürünler", href: "/urunler" },
      { name: "Fıstık Ezmeleri", href: "/kategori/fistik-ezmesi" },
      { name: "Fındık Ezmeleri", href: "/kategori/findik-ezmesi" },
      { name: "Kuruyemişler", href: "/kategori/kuruyemis" },
    ],
    company: [
      { name: "Hakkımızda", href: "/hakkimizda" },
      { name: "Blog", href: "/blog" },
      { name: "İletişim", href: "/iletisim" },
      { name: "SSS", href: "/sss" },
    ],
    support: [
      { name: "Kargo & Teslimat", href: "/kargo" },
      { name: "İade & Değişim", href: "/iade" },
      { name: "Gizlilik Politikası", href: "/gizlilik" },
      { name: "Hizmet Şartları", href: "/sartlar" },
    ],
  };

  return (
    <footer className="bg-[#7B1113] text-white overflow-hidden">
      {/* Newsletter Section - Premium Design */}
      <div className="relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F3E0E1]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#F3E0E1]/5 rounded-full blur-2xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E0E1]/20 text-[#F3E0E1] text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Özel Fırsatlar
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">
                    İlk Siparişine Özel %10 İndirim
                  </h3>
                  <p className="text-white/70">
                    E-bültenimize abone olarak indirimden yararlanabilirsin.
                  </p>
                </div>
                
                <form className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      placeholder="E-posta adresin"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F3E0E1]/50 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#7B1113] rounded-xl font-semibold hover:bg-[#F3E0E1] transition-all group whitespace-nowrap"
                  >
                    Abone Ol
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#F3E0E1]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Güvenli Alışveriş</p>
                    <p className="text-white/50 text-xs">256-bit SSL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#F3E0E1]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Hızlı Kargo</p>
                    <p className="text-white/50 text-xs">500₺+ Ücretsiz</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#F3E0E1]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">14 Gün İade</p>
                    <p className="text-white/50 text-xs">Koşulsuz</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <Image 
                src="/logo.webp" 
                alt={SITE_NAME} 
                width={140}
                height={48}
                className="h-12 w-auto brightness-0 invert"
                sizes="140px"
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-xs">
              %100 doğal, katkısız fıstık ezmeleri ve kuruyemişler. Sağlıklı yaşamın vazgeçilmezi.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <SocialLink href={socialLinks.instagram} label="Instagram">
                <Instagram className="w-5 h-5" />
              </SocialLink>
              <SocialLink href={socialLinks.facebook} label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </SocialLink>
              <SocialLink href={socialLinks.twitter} label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <FooterColumn title="Ürünler" links={footerLinks.products} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Kurumsal" links={footerLinks.company} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Yardım" links={footerLinks.support} />
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">İletişim</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-3 text-white/70 hover:text-white text-sm transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F3E0E1] group-hover:text-[#7B1113] transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="break-all pt-1">{contactInfo.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-start gap-3 text-white/70 hover:text-white text-sm transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F3E0E1] group-hover:text-[#7B1113] transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="pt-1">{contactInfo.phone}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-white/70 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="leading-relaxed pt-1">{contactInfo.address || "Türkiye"}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-white/50 flex items-center gap-1">
              © {currentYear} {SITE_NAME}. Tüm hakları saklıdır. 
              <span className="hidden md:inline">•</span>
              <span className="hidden md:flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#F3E0E1]" /> ile yapıldı
              </span>
            </p>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40">Güvenli Ödeme:</span>
              <div className="flex items-center gap-2">
                <PaymentBadge text="VISA" />
                <PaymentBadge text="MASTERCARD" short="MC" />
                <PaymentBadge text="AMEX" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper Components
function FooterColumn({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link 
              href={link.href} 
              className="text-white/70 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 bg-white/10 hover:bg-[#F3E0E1] hover:text-[#7B1113] rounded-xl flex items-center justify-center transition-all duration-300"
      aria-label={label}
    >
      {children}
    </a>
  );
}

function PaymentBadge({ text, short }: { text: string; short?: string }) {
  return (
    <div className="h-7 px-2.5 bg-white/10 rounded-md flex items-center justify-center border border-white/5">
      <span className="text-[10px] font-bold text-white/80 tracking-wider">
        {short || text}
      </span>
    </div>
  );
}
