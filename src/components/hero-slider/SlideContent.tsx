import type { Slide } from "@/data/slides";
import styles from "./HeroSlider.module.css";

interface SlideContentProps {
  slide: Slide;
}

/**
 * The display word set across the foot of a frame. It lives inside the slide,
 * so it travels with the plate during a transition and darkens with it under
 * the scrim — exactly as a page would.
 */
export function SlideContent({ slide }: SlideContentProps) {
  return (
    <div className={styles.content} data-tone={slide.tone}>
      <p className={styles.display}>{slide.display}</p>
    </div>
  );
}
