import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // These headers allow iOS and Android to verify that this domain
  // is associated with the Rentora app — required for deep links to work.
  // The files themselves live in /public/.well-known/
  async headers() {
    return [
      {
        // iOS reads this file to decide if a link should open in the app.
        // Must be served as application/json (no file extension, so Next.js
        // won't set the right content-type automatically — this header fixes that).
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        // Android reads this file to verify the app owns the domain.
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;