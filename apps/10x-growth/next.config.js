/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@sasarjan/auth',
    '@sasarjan/database',
    '@sasarjan/profile-core',
    '@sasarjan/ui'
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
}

module.exports = nextConfig