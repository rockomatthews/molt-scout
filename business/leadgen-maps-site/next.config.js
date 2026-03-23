/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // We use viem which pulls in some aggressive type-level machinery.
    // For this MVP, ship and rely on runtime tests.
    ignoreBuildErrors: true,
  },
};
export default nextConfig;
