import type { MetadataRoute } from 'next'
import { rugs } from '@/data/rugs'
import { collections } from '@/data/products'
import { siteUrl } from '@/lib/site'

/**
 * Every address on the site.
 *
 * This used to list three URLs, because the site was one page and two legal notices.
 * It now lists a page per rug. That is the difference the restructure makes to how the
 * shop is seen from outside: a hundred and twelve products that a search engine can
 * find, index and show individually, rather than one document that mentions them.
 *
 * The privacy policy stays here for a second reason: Meta's ad review and business
 * verification both look for a reachable, discoverable privacy policy, and a sitemap
 * entry is the most reliable way to make sure their crawler finds it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl()
  const lastModified = new Date()

  return [
    { url, lastModified, changeFrequency: 'monthly', priority: 1 },

    // The two ways into the range. Higher priority than any single rug: these are the
    // pages that should rank for "handwoven rugs", and they are how a crawler reaches
    // every rug below.
    { url: `${url}/rugs`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${url}/collections`, lastModified, changeFrequency: 'monthly', priority: 0.8 },

    ...collections.map((collection) => ({
      url: `${url}/collections/${collection.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // The curated rugs are specified in full and photographed in rooms, so they are the
    // better landing pages; the catalogue rugs have a photograph and an honest caption.
    // That difference is real, and it is what the priority split says.
    ...rugs.map((rug) => ({
      url: `${url}${rug.href}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: rug.group === 'curated' ? 0.7 : 0.6,
    })),

    {
      url: `${url}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    { url: `${url}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
