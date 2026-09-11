import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.32"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.1.32",
        port: "3568",
        pathname: "/api/thumb/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
