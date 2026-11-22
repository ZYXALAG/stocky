const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  exclude: [
    /\/_next\/.+/,
    /\/api\/.+/,
    /.*\.(svg|ico|png|jpg|jpeg|gif|webp)$/,
    /\/api\/(auth|supabase)/,
  ],
  include: [
    /\/dashboard/,
    /\/produits/,
    /\/mouvements/,
    /\/categories/,
    /\/fournisseurs/,
    /\/alertes/,
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [],
  },
};

module.exports = withPWA(nextConfig);
