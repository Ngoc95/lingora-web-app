import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://lingora-be-dxce.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
