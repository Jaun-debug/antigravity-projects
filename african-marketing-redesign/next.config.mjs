/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.african-marketing.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'afmar.eu.xmsymphony.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
