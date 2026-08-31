import Image from "next/image";

import type { Brandmark as BrandmarkData } from "@/data/slides";
import styles from "./HeroSlider.module.css";

interface BrandmarkProps {
  brandmark: BrandmarkData;
}

export function Brandmark({ brandmark }: BrandmarkProps) {
  return (
    <div className={styles.brandmark} data-slider-nodrag>
      <Image
        className={styles.brandmarkImage}
        src={brandmark.image}
        alt={brandmark.alt}
        sizes="180px"
        priority
        draggable={false}
      />
    </div>
  );
}
