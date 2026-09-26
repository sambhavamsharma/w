import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero images are scaled slightly beyond the viewport, so they are
    // served a notch above the default quality. The mosaic tiles are small and
    // mostly behind the centre frame, so they go a notch below it.
    qualities: [70, 75, 85],
  },
};

export default nextConfig;
