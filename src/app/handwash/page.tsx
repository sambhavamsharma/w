import type { Metadata } from "next";

import { Hero } from "@/components/handwash/Hero";

export const metadata: Metadata = {
  title: "Hand Wash — Washela",
  description: "The Washela hand wash range: citrus, tea tree and lavender.",
};

export default function HandwashPage() {
  return (
    <main>
      <Hero />
    </main>
  );
}
