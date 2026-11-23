/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  webpack: (config) => {
    // PWA will be handled by a manual service worker setup
    return config;
  },
};

module.exports = nextConfig;
