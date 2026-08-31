import { HeroSlider } from "@/components/hero-slider/HeroSlider";
import { ScrollPanels } from "@/components/showcase/ScrollPanels";
import { ScrollShowcase } from "@/components/showcase/ScrollShowcase";
import { panels, showcase } from "@/data/showcase";
import { brandmark, slides } from "@/data/slides";

export default function Home() {
  return (
    <main>
      <HeroSlider slides={slides} brandmark={brandmark} />
      <ScrollShowcase showcase={showcase} />
      <ScrollPanels panels={panels} brandmark={brandmark} />
    </main>
  );
}
