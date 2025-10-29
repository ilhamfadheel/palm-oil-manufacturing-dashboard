/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next.js 16 experimental features
    ppr: false, // Partial Prerendering
  },
}

module.exports = nextConfig
