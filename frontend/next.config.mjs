/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@clerk/nextjs'],
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