import Image from "next/image";

import type { Brandmark } from "@/data/slides";
import type { Panel } from "@/data/showcase";
import { PerspectiveCarousel } from "@/components/ui/perspective-carousel";
import styles from "./ScrollPanels.module.css";

export interface ScrollPanelsProps {
  panels: Panel[];
  /** Small wordmark that rides along the top of the panels. */
  brandmark?: Brandmark;
}

/**
 * The panels that close the page.
 *
 * The wrapper is pulled up by a viewport so the first panel rises over the
 * still-pinned mosaic rather than waiting for it to scroll away — which is the
 * handoff the reference makes between its sections. From there the panels flow
 * normally, one after the other.
 */
export function ScrollPanels({ panels, brandmark }: ScrollPanelsProps) {
  return (
    <div className={styles.panels}>
      {brandmark ? (
        <div className={styles.brandmark}>
          <Image
            className={styles.brandmarkImage}
            src={brandmark.image}
            alt={brandmark.alt}
            sizes="140px"
            draggable={false}
          />
        </div>
      ) : null}

      {panels.map((panel) => (
        <section
          key={panel.id}
          className={styles.panel}
          data-tone={panel.tone}
          data-carousel={panel.carousel ? "true" : undefined}
        >
          <h2 className={styles.title}>{panel.title}</h2>

          {panel.carousel ? (
            <div className={styles.carousel}>
              <PerspectiveCarousel
                items={panel.carousel.map((slide) => ({
                  src: slide.image.src,
                  title: slide.title,
                  alt: slide.alt,
                }))}
                loop
                slideWidth={230}
                labelClassName="text-white/85 uppercase tracking-[0.22em] text-[0.625rem]"
                controlsClassName="border-white/20 bg-black/25 text-white backdrop-blur-sm"
              />
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
