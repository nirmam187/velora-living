import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

/**
 * The site is a single page, so the sitemap lists the homepage and its section
 * anchors. Anchors are not separate URLs to a crawler, but listing the canonical
 * page once with an accurate lastModified is what actually matters here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl()

  return [
    {
      url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
