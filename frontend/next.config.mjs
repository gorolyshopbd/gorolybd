/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'z6zhffa4.ap-southeast.insforge.app',
      },
      {
        protocol: 'https',
        hostname: '**.insforge.app',
      },
    ],
  },
};

export default nextConfig;
