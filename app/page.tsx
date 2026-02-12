import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Marquee } from "@/components/sections/Marquee";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <TrustBadges />
      <Marquee />
      <Categories />
      <FeaturedProducts />
      <Testimonials />
    </>
  );
}
