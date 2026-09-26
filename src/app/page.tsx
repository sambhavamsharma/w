import { Hero } from "@/components/handwash/Hero";
import { RangeStage } from "@/components/showcase/RangeStage";
import { ContactFooter } from "@/components/ui/contact-footer";
import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import { panels, showcase } from "@/data/showcase";
import { brandmark } from "@/data/slides";

const [rangePanel] = panels;

export default function Home() {
  return (
    <main>
      {/* The hero scrolls away with a parallax on its layers and hands straight
          over to the statement panel — no scene in between. The panel reserves
          a viewport at its foot for the Range page to rise over. */}
      <ParallaxComponent eyebrow={showcase.eyebrow} statement={showcase.body}>
        <Hero />
      </ParallaxComponent>

      {/* The Range page, sweeping straight into the contact footer on the way out. */}
      <RangeStage
        panel={rangePanel}
        brandmark={brandmark}
        curtainColor="#ffffff"
      />

      <ContactFooter />
    </main>
  );
}
