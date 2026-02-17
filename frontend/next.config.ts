import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // Production API server for uploaded images
      {
        protocol: 'https',
        hostname: 'api.sobatbantu.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // VULN-002: Prevent HTTP downgrade / MITM via SSL Stripping
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // VULN-003: Prevent Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // VULN-004: Content Security Policy — prevent XSS
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow inline scripts for Next.js hydration + Google OAuth SDK
              "script-src 'self' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com",
              // Allow inline styles for Tailwind
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + API server + common CDNs
              "img-src 'self' data: blob: https://api.sobatbantu.com https://*.cloudinary.com https://*.amazonaws.com https://images.unsplash.com https://picsum.photos https://lh3.googleusercontent.com",
              // API calls: backend + Google APIs for OAuth
              "connect-src 'self' https://api.sobatbantu.com https://accounts.google.com https://www.googleapis.com",
              // Google OAuth frame
              "frame-src https://accounts.google.com",
              // Block embedding this site in iframes
              "frame-ancestors 'none'",
              // Only allow form submissions to self
              "form-action 'self'",
            ].join('; '),
          },
          // VULN-005: Prevent MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent leaking referrer info to third parties
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser feature access
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
