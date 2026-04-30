/** @type {import('next').NextConfig} */
const nextConfig = {
    // serverComponentsExternalPackages dikeluarkan dari experimental di Next.js 14.1+
    serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
