/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for now
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;