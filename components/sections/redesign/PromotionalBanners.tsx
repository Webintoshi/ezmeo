
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromotionalBanners() {
  return (
    <section className="redesign-section redesign-section--alt" id="promotional-banners">
      <div className="redesign-container">
        <div className="promo-banners__grid">
          
          {/* Banner 1 */}
          <div className="promo-banners__card promo-banners__card--1">
            <Image
              src="/hero banner fıstık ezmeleri.jpg"
              alt="Doğal Fıstık Ezmesi"
              fill
              className="promo-banners__image"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="promo-banners__content">
              <span className="promo-banners__subtitle">Her Gün Taze</span>
              <h3 className="promo-banners__title">Doğal Fıstık Ezmesi</h3>
              <Link href="/koleksiyon/fistik-ezmesi" className="promo-banners__button">
                İncele
              </Link>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="promo-banners__card promo-banners__card--2">
            <Image
              src="/Hero_banner_Bir.jpg"
              alt="Yeni Sezon Ürünler"
              fill
              className="promo-banners__image"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="promo-banners__content">
              <span className="promo-banners__subtitle">Yeni Geldi!</span>
              <h3 className="promo-banners__title">Süper Gıdalar</h3>
              <Link href="/koleksiyon/yeni-urunler" className="promo-banners__button">
                Keşfet
              </Link>
            </div>
          </div>

          {/* Banner 3 */}
          <div className="promo-banners__card promo-banners__card--3">
            <Image
              src="/Findik_Ezmeleri_Kategorisi.webp"
              alt="Organik Kuruyemiş"
              fill
              className="promo-banners__image"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="promo-banners__content">
              <span className="promo-banners__subtitle">Koleksiyon</span>
              <h3 className="promo-banners__title">Saf Organik</h3>
              <Link href="/koleksiyon/kuruyemis" className="promo-banners__button">
                Göz At
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
