import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Several projects share this parent folder; pin the root so Turbopack does
  // not walk up and pick a sibling lockfile.
  turbopack: { root: __dirname },
};

export default nextConfig;
