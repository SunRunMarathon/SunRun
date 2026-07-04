import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "sunrun.pl",
    "www.sunrun.pl",
    "sunrun-production.up.railway.app",
  ],
};

export default nextConfig;
