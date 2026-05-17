import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/logo.png" },
    ],
  },
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
