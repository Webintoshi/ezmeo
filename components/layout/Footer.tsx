import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { SITE_NAME, FOOTER_LINKS, CONTACT_INFO, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">E-Bültene Abone Ol</h3>
            <p className="text-primary-foreground/70 mb-6">
              Siparişi tamamlarken adresinize gönderilen kuponu kullanmayı unutmayın.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-white placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                Abone Ol
              </button>
            </form>
            <p className="text-xs text-primary-foreground/50 mt-3">
              %5 İndirim Kazan!
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{SITE_NAME}</h3>
                <p className="text-xs text-primary-foreground/70">
                  Doğalın En Saf Hali
                </p>
              </div>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              %100 doğal, katkısız kuruyemiş ezmeleri. Kahvaltınıza doğallık,
              tariflerinize enerji katıyoruz.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>

            {/* App Store Buttons - Coming Soon */}
            <div className="mt-6">
              <p className="text-xs text-primary-foreground/50 mb-2">
                Çok Yakında...
              </p>
              <div className="flex gap-2">
                <div className="w-32 h-10 bg-primary-foreground/10 rounded flex items-center justify-center">
                  <span className="text-xs">App Store</span>
                </div>
                <div className="w-32 h-10 bg-primary-foreground/10 rounded flex items-center justify-center">
                  <span className="text-xs">Google Play</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Kategoriler</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="font-semibold mb-4">Faydalı Linkler</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.useful.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-4">Politikalar</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.policies.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-2 text-primary-foreground/70 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm">{CONTACT_INFO.email}</span>
              </a>
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className="flex items-center gap-2 text-primary-foreground/70 hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm">{CONTACT_INFO.phone}</span>
              </a>
              <span className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{CONTACT_INFO.address}</span>
              </span>
            </div>

            <p className="text-primary-foreground/50 text-sm">
              © {currentYear} {SITE_NAME}. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
