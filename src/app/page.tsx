import { HeroSlider } from "@/components/hero-slider/HeroSlider";
import { RangeStage } from "@/components/showcase/RangeStage";
import { ScrollPanels } from "@/components/showcase/ScrollPanels";
import { ScrollShowcase } from "@/components/showcase/ScrollShowcase";
import { deepTone, panels, showcase } from "@/data/showcase";
import { brandmark, slides } from "@/data/slides";

const [rangePanel, connectPanel] = panels;

export default function Home() {
  return (
    <main>
      <HeroSlider slides={slides} brandmark={brandmark} />
      <ScrollShowcase showcase={showcase} />

      {/* The Range page, sweeping straight into Connect on the way out. */}
      <RangeStage
        panel={rangePanel}
        brandmark={brandmark}
        curtainColor={deepTone}
      />

      <ScrollPanels
        panels={[connectPanel]}
        brandmark={brandmark}
        overlapPrevious={false}
      />
    </main>
  );
}
