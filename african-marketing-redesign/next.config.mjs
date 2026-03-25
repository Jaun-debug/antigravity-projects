/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.african-marketing.com',
      },
      {
        protocol: 'https',
        hostname: 'afmar.eu.xmsymphony.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.1.commercebuild.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.3.commercebuild.com',
      }
    ],
  },
};

export default nextConfig;
