import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),

  images: {
    remotePatterns: [
      // app.qrbir.com'da barındırılan upload görselleri
      {
        protocol: "https",
        hostname: "app.qrbir.com",
        pathname: "/uploads/**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Tüm rotalara güvenlik başlıkları uygula
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Pub sayfaları — iframe embed'e izin ver (QR menüler için)
        source: "/pub/(.*)",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "X-Frame-Options"),
          { key: "X-Frame-Options", value: "ALLOWALL" },
        ],
      },
    ];
  },
};

export default nextConfig;
