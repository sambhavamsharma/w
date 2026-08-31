import { HeroSlider } from "@/components/hero-slider/HeroSlider";
import { brandmark, slides } from "@/data/slides";

export default function Home() {
  return (
    <main>
      <HeroSlider slides={slides} brandmark={brandmark} />
    </main>
  );
}
