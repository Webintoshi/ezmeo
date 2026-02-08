import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Marquee } from "@/components/sections/Marquee";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustFeatures } from "@/components/sections/TrustFeatures";
import { NutsListing } from "@/components/sections/NutsListing";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Categories />
      <FeaturedProducts />
      <TrustFeatures />
      <NutsListing />
      <Testimonials />
    </>
  );
}
