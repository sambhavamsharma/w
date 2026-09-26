import Link from "next/link";

import type { Slide } from "@/data/slides";
import styles from "./HeroSlider.module.css";

interface BottomNavProps {
  slides: Slide[];
  current: number;
  /** Drives the hairline sweep that doubles as the autoplay countdown. */
  timing: boolean;
}

/**
 * Doubles as the product entry point: each label still tracks the slide
 * showing behind it (autoplay, swipe, arrow keys all still drive that), but
 * a click no longer switches slides in place — it takes the reader to the
 * hand wash page, where the same three scents wait as an actual choice.
 */
export function BottomNav({ slides, current, timing }: BottomNavProps) {
  return (
    <nav className={styles.bottomNav} aria-label="Shop hand wash" data-slider-nodrag>
      <ul className={styles.navList}>
        {slides.map((slide, index) => {
          const isActive = index === current;

          return (
            <li
              key={slide.id}
              className={styles.navItem}
              data-active={isActive ? "true" : "false"}
            >
              <Link
                href="/handwash"
                className={`${styles.navButton} ${styles.label}`}
                data-active={isActive ? "true" : "false"}
                data-timing={isActive && timing ? "true" : "false"}
                aria-current={isActive ? "true" : undefined}
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
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
