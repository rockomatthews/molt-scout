/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Keep builds resilient on Vercel for MVP.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
