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
  // Custom build ID for consistent builds
  generateBuildId: async () => {
    return 'erblogx-build'
  },
};

export default nextConfig;