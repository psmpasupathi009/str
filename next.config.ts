import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Keep CSP reasonably permissive for Next/3rd party scripts (Razorpay) but safer than none.
          // Tighten further once you list all required script/style/image domains.
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "base-uri 'self'; " +
              "frame-ancestors 'none'; " +
              "object-src 'none'; " +
              "img-src 'self' data: blob: https:; " +
              "style-src 'self' 'unsafe-inline' https:; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
              "connect-src 'self' https:; " +
              "frame-src 'self' https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
