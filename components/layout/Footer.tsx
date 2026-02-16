import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Send } from "lucide-react";
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

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section - Modern & Clean */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Özel Fırsatları Kaçırma
            </h3>
            <p className="text-white/70 text-base mb-8">
              İlk siparişinde %10 indirim kazanmak için e-bültene abone ol
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresin"
                className="flex-1 px-5 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-neutral-900 rounded-lg font-semibold hover:bg-white/90 transition-all"
              >
                <Send className="h-4 w-4" />
                Abone Ol
              </button>
            </form>
            
            <p className="text-xs text-white/50 mt-4">
              Dilediğin zaman abonelikten çıkabilirsin
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer - Clean Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <img src="/logo.webp" alt={SITE_NAME} className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              %100 doğal, katkısız fıstık ezmeleri ve kuruyemişler. Sağlıklı yaşamın vazgeçilmezi.
            </p>
            
            {/* Social Media - Minimal */}
            <div className="flex gap-3">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white hover:text-neutral-900 rounded-lg flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white hover:text-neutral-900 rounded-lg flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white hover:text-neutral-900 rounded-lg flex items-center justify-center transition-all"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Ürünler */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Ürünler</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/urunler" className="text-white/60 hover:text-white text-sm transition-colors">
                  Tüm Ürünler
                </Link>
              </li>
              <li>
                <Link href="/kategori/fistik-ezmesi" className="text-white/60 hover:text-white text-sm transition-colors">
                  Fıstık Ezmeleri
                </Link>
              </li>
              <li>
                <Link href="/kategori/findik-ezmesi" className="text-white/60 hover:text-white text-sm transition-colors">
                  Fındık Ezmeleri
                </Link>
              </li>
              <li>
                <Link href="/kategori/kuruyemis" className="text-white/60 hover:text-white text-sm transition-colors">
                  Kuruyemişler
                </Link>
              </li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Kurumsal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/hakkimizda" className="text-white/60 hover:text-white text-sm transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/60 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-white/60 hover:text-white text-sm transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-white/60 hover:text-white text-sm transition-colors">
                  SSS
                </Link>
              </li>
            </ul>
          </div>

          {/* Yardım */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Yardım</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/kargo" className="text-white/60 hover:text-white text-sm transition-colors">
                  Kargo & Teslimat
                </Link>
              </li>
              <li>
                <Link href="/iade" className="text-white/60 hover:text-white text-sm transition-colors">
                  İade & Değişim
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="text-white/60 hover:text-white text-sm transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/sartlar" className="text-white/60 hover:text-white text-sm transition-colors">
                  Hizmet Şartları
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-2 text-white/60 hover:text-white text-sm transition-colors group"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-white" />
                  <span className="break-all">{contactInfo.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-start gap-2 text-white/60 hover:text-white text-sm transition-colors group"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-white" />
                  <span>{contactInfo.phone}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{contactInfo.address || "Türkiye"}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar - Clean & Organized */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Left - Copyright */}
            <p className="text-sm text-white/50">
              © {currentYear} {SITE_NAME}. Tüm hakları saklıdır.
            </p>
            
            {/* Center - Secure Payment */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">Güvenli Ödeme</span>
              <div className="flex items-center gap-2">
                <div className="h-6 px-2 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white/80 tracking-wider">VISA</span>
                </div>
                <div className="h-6 px-2 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white/80 tracking-wider">MC</span>
                </div>
                <div className="h-6 px-2 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white/80 tracking-wider">AMEX</span>
                </div>
              </div>
            </div>
            
            {/* Right - Webintosh (Original Design) */}
            <a 
              href="https://webintoshi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
            >
              <div className="flex flex-col items-end">
                <span className="text-[6px] font-medium tracking-widest text-gray-500 uppercase leading-none mb-0.5">Designed by</span>
                <span className="text-[8px] font-bold tracking-[0.2em] text-white leading-none group-hover:text-gray-200 transition-colors">WEBINTOSH</span>
              </div>
              <div className="h-3 w-[1px] bg-white/10 mx-0.5"></div>
              <img 
                src="/webintosh%20logo.svg" 
                alt="Webintosh" 
                className="h-3 w-auto opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
              />
            </a>
          </div>
          
          {/* Mobile Layout - Stacked */}
          <div className="flex md:hidden flex-col items-center gap-4">
            {/* Webintosh (Original Design) */}
            <a 
              href="https://webintoshi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-2 py-1.5 rounded-full border border-white/5 bg-white/[0.02]"
            >
              <div className="flex flex-col items-end">
                <span className="text-[5px] font-medium tracking-widest text-gray-500 uppercase leading-none mb-0.5">Designed by</span>
                <span className="text-[7px] font-bold tracking-[0.15em] text-white leading-none">WEBINTOSH</span>
              </div>
              <div className="h-2.5 w-[1px] bg-white/10 mx-0.5"></div>
              <img 
                src="/webintosh%20logo.svg" 
                alt="Webintosh" 
                className="h-2.5 w-auto opacity-80"
              />
            </a>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Güvenli Ödeme</span>
              <div className="flex items-center gap-1.5">
                <div className="h-5 px-1.5 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-white/80">VISA</span>
                </div>
                <div className="h-5 px-1.5 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-white/80">MC</span>
                </div>
                <div className="h-5 px-1.5 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-white/80">AMEX</span>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <p className="text-xs text-white/50 text-center">
              © {currentYear} {SITE_NAME}. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
