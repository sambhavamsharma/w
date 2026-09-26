"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Store } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import bottle from "@/assets/hero/bottle.png";
import { brandmark } from "@/data/slides";
import { ArrowIcon } from "./icons";
import styles from "./Hero.module.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const NAV_LINKS = [
  { label: "Range", href: "/#range" },
  { label: "Ingredients", href: "#" },
  { label: "Story", href: "/" },
  { label: "Contact", href: "/#contact" },
];

const SOCIALS = [
  {
    label: "IndiaMART",
    href: "https://www.indiamart.com/washela-consumer-product/",
    Icon: Store,
  },
];

/**
 * Releases the bottle's held entrance (see `.scope:not([data-bottle-ready])`
 * in the CSS) once its image is decoded. It runs inline, as the page is
 * parsed, rather than from an effect: on a first visit the bundle can take
 * seconds to hydrate, and the bottle must not wait on it — nor start its
 * animation before the image exists, which is what left it popping in with no
 * motion, or missing. A timeout releases it regardless if the image stalls.
 */
const RELEASE_BOTTLE = `(function(){var s=document.currentScript,r=s&&s.closest("[data-hero]");if(!r)return;var i=r.querySelector("img[data-bottle]"),d=false;function go(){if(d)return;d=true;requestAnimationFrame(function(){requestAnimationFrame(function(){r.setAttribute("data-bottle-ready","")})})}function dec(){(i.decode?i.decode():Promise.resolve()).then(go,go)}setTimeout(go,4000);if(!i){go();return}if(i.complete&&i.naturalWidth>0)dec();else{i.addEventListener("load",dec,{once:true});i.addEventListener("error",go,{once:true})}})();`;

/** Stagger index for the entrance choreography. */
const d = (n: number) => ({ "--d": n }) as CSSProperties;

/**
 * The hero: copy set over a dark gradient that blooms into
 * the scent's colour while the bottle rises into frame, tilted, from below.
 *
 * Two elements carry `data-parallax-layer` — the bottle (1) and the text
 * block (2) — so the parallax wrapper around this component can move them at
 * different speeds as the page scrolls. The nav row carries none on purpose:
 * it stays a plain element, so the menu button keeps rising above the
 * slide-in sheet.
 */
export function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [onPanel, setOnPanel] = useState(false);
  const syncBurgerContrast = useCallback(() => {
    const btn = toggleRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;
    // The panel is right-anchored and capped at 460px, so on a wide screen it
    // can stop short of the burger — measure rather than guess a breakpoint.
    const panelLeft = window.innerWidth - panel.getBoundingClientRect().width;
    const onPanelNow = btn.getBoundingClientRect().right > panelLeft + 4;
    setOnPanel(onPanelNow);
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      setIsOpen((prev) => {
        if (prev === next) return prev;
        if (next) syncBurgerContrast();
        return next;
      });
    },
    [syncBurgerContrast],
  );

  // Scroll lock, matching the global `body.nav-open { overflow: hidden }` rule.
  useEffect(() => {
    document.body.classList.toggle("nav-open", isOpen);
    return () => document.body.classList.remove("nav-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => syncBurgerContrast();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen, setOpen, syncBurgerContrast]);

  const onSheetClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.hasAttribute("data-nav-close") || target.closest("a")) {
        setOpen(false);
      }
    },
    [setOpen],
  );

  return (
    // The inline release script sets `data-bottle-ready` before hydration, on
    // purpose — React shouldn't flag that attribute as a mismatch.
    <div
      className={`${styles.scope} ${plusJakarta.className}`}
      data-hero
      suppressHydrationWarning
    >
      {/* Without scripts nothing would ever release the held bottle. */}
      <noscript>
        <style>
          {"[data-hero] img{animation-play-state:running!important}"}
        </style>
      </noscript>
      <section className={styles.hero}>
        {/* Painted first so everything after it sits above — no z-index, so
            the burger can still rise above the nav sheet. */}
        <div className={styles.bloom} aria-hidden="true" />

        <div className={styles.bottleWrap} data-parallax-layer="1">
          <Image
            className={styles.bottle}
            src={bottle}
            alt="Washela lavender hand wash bottle."
            fill
            sizes="(max-width: 768px) 60vw, 30vw"
            quality={85}
            priority
            draggable={false}
            data-bottle
          />
          <script dangerouslySetInnerHTML={{ __html: RELEASE_BOTTLE }} />
        </div>

        <nav className={styles.top} aria-label="Primary">
          <Link href="/" className={styles.brand} aria-label="Washela home">
            <Image
              className={styles.brandLogo}
              src={brandmark.image}
              alt={brandmark.alt}
              priority
              draggable={false}
              data-anim
              style={d(0)}
            />
          </Link>

          <ul className={styles.navLinks}>
            {NAV_LINKS.map((link, index) => (
              <li key={link.label} data-anim style={d(1 + index)}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <button
            ref={toggleRef}
            type="button"
            className={styles.burger}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="navSheet"
            data-active={isOpen || undefined}
            data-on-panel={onPanel || undefined}
            data-anim
            style={d(2)}
            onClick={() => setOpen(!isOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        <div className={styles.foot} data-parallax-layer="2">
          <h1 className={styles.footTitle} data-anim style={d(3)}>
            Clean, but
            <br />
            make it chill.
          </h1>
          <p className={styles.footText} data-anim style={d(4)}>
            Hand wash, dish wash and floor cleaner that smell like a good mood.
            Do the chores, keep the vibe.
          </p>
        </div>
      </section>

      <div
        className={styles.navsheet}
        id="navSheet"
        data-open={isOpen || undefined}
        inert={!isOpen}
        onClick={onSheetClick}
      >
        <div className={styles.navsheetScrim} data-nav-close="true" />

        <nav ref={panelRef} className={styles.navsheetPanel} aria-label="Menu">
          <ul className={styles.navsheetList}>
            {NAV_LINKS.map((link, index) => (
              <li key={link.label} style={{ "--i": index } as CSSProperties}>
                <a className={styles.navsheetLink} href={link.href}>
                  {link.label}
                  <ArrowIcon size={22} />
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.navsheetFoot}>
            <div className={styles.navsheetSocials}>
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={22} aria-hidden="true" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
