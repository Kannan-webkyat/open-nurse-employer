/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
    // Also allow any hostname for development (you can restrict this in production)
    domains: ['localhost'],
  },
}

module.exports = nextConfig

