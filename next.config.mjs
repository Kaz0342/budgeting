/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prisma dijalankan di server-side, jangan di-bundle oleh webpack
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
