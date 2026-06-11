/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
  experimental: {
    serverComponentsExternalPackages: ['cheerio'],
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}
module.exports = nextConfig
