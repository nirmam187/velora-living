import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: 'Velora',
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E6',
    theme_color: '#F5F0E6',
    icons: [
      {
        src: '/images/brand/velora-mark-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
