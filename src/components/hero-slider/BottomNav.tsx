import type { Slide } from "@/data/slides";
import styles from "./HeroSlider.module.css";

interface BottomNavProps {
  slides: Slide[];
  current: number;
  /** Drives the hairline sweep that doubles as the autoplay countdown. */
  timing: boolean;
  onSelect: (index: number) => void;
}

export function BottomNav({ slides, current, timing, onSelect }: BottomNavProps) {
  return (
    <nav className={styles.bottomNav} aria-label="Slides" data-slider-nodrag>
      <ul className={styles.navList}>
        {slides.map((slide, index) => {
          const isActive = index === current;

          return (
            <li
              key={slide.id}
              className={styles.navItem}
              data-active={isActive ? "true" : "false"}
            >
              <button
                type="button"
                className={`${styles.navButton} ${styles.label}`}
                data-active={isActive ? "true" : "false"}
                data-timing={isActive && timing ? "true" : "false"}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(index)}
              >
                <span className={styles.navRule} aria-hidden="true">
                  <span
                    // Re-keyed per activation so the sweep restarts cleanly
                    // each time this slide becomes the active one.
                    key={isActive ? `active-${current}` : "idle"}
                    className={styles.navRuleFill}
                  />
                </span>
                <span className={styles.navLabel}>
                  <span className={styles.navIndex}>{slide.index}</span>
                  <span className={styles.navTitle}>{slide.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
