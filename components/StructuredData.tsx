import { products } from '@/data/products'
import { site, siteUrl } from '@/lib/site'

/**
 * JSON-LD for search engines: who the brand is, and what it sells. The product
 * list is generated from data/products.ts, so a rug added there is described here
 * too without any extra step.
 *
 * No prices are published anywhere on the site, so `offers` is deliberately omitted
 * rather than filled with a placeholder — a wrong price in structured data is worse
 * than none.
 */
export default function StructuredData() {
  const url = siteUrl()

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${url}/#organization`,
      name: site.name,
      url,
      description: site.description,
      email: site.email,
      logo: `${url}/images/brand/velora-monogram.jpg`,
      sameAs: [site.instagram],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jaipur',
        addressRegion: 'Rajasthan',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${url}/#website`,
      url,
      name: site.name,
      description: site.description,
      publisher: { '@id': `${url}/#organization` },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'ItemList',
      '@id': `${url}/#catalogue`,
      name: 'Velora Living rug catalogue',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          sku: product.code,
          description: product.description,
          image: `${url}${product.image}`,
          material: product.materials.join(', '),
          brand: { '@id': `${url}/#organization` },
        },
      })),
    },
  ]

  return (
    <script
      type="application/ld+json"
      // The content is built entirely from our own data, never from user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  )
}
