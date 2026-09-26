import { Hero } from "@/components/handwash/Hero";
import { RangeStage } from "@/components/showcase/RangeStage";
import { ScrollPanels } from "@/components/showcase/ScrollPanels";
import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import { deepTone, panels, showcase } from "@/data/showcase";
import { brandmark } from "@/data/slides";

const [rangePanel, connectPanel] = panels;

export default function Home() {
  return (
    <main>
      {/* The hero scrolls away with a parallax on its layers and hands straight
          over to the statement panel — no scene in between. The panel reserves
          a viewport at its foot for the Range page to rise over. */}
      <ParallaxComponent eyebrow={showcase.eyebrow} statement={showcase.body}>
        <Hero />
      </ParallaxComponent>

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
