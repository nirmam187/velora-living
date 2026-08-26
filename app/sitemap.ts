import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

/**
 * The marketing site is a single page, so the sitemap lists that page and the two
 * legal pages. Section anchors are not separate URLs to a crawler; listing the
 * canonical page once with an accurate lastModified is what actually matters.
 *
 * The privacy policy is here for a second reason: Meta's ad review and business
 * verification both look for a reachable, discoverable privacy policy, and a
 * sitemap entry is the most reliable way to make sure their crawler finds it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl()
  const lastModified = new Date()

  return [
    {
      url,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${url}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${url}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
