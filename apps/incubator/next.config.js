/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sasarjan/ui", "@sasarjan/auth", "@sasarjan/database"],
  images: {
    domains: ['localhost', 'rvsxblqkjssvsccxvwbl.supabase.co'],
  },
}

module.exports = nextConfig