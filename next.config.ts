import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://boo-ik.firebaseapp.com/__/auth/:path*",
      },
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.API_PROXY_TARGET || "http://localhost:3002"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
