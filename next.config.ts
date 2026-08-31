import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero images are scaled slightly beyond the viewport, so they are
    // served a notch above the default quality.
    qualities: [75, 85],
  },
};

export default nextConfig;
