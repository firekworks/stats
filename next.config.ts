import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    useLightningcss: false,
    webpackBuildWorker: false
  }
};

export default nextConfig;
