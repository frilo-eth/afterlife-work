/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable teaser mode
  env: {
    SHOW_TEASER: 'false',
  },

  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: false,
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}

//THIS STAYS
module.exports = nextConfig
