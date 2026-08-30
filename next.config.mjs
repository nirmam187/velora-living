/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serve modern formats automatically. AVIF first, WebP as the fallback.
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        // Hashed image files never change under a given name, so cache hard.
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // AR models. Same caching argument as the images — a model is rebuilt under a
        // new name, never edited in place.
        source: '/ar/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // iOS decides whether to hand a file to AR Quick Look partly on its content
        // type, and the default octet-stream can leave Safari downloading the model
        // instead of opening it in the camera. Next does not know this extension, so
        // the type is set here explicitly.
        source: '/ar/:path*.usdz',
        headers: [
          { key: 'Content-Type', value: 'model/vnd.usdz+zip' },
        ],
      },
    ]
  },
}

export default nextConfig
