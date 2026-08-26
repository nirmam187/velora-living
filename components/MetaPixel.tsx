'use client'

import Script from 'next/script'
import { metaPixelId, pixelEnabled } from '@/lib/meta-pixel'

/**
 * The Meta Pixel base code, site-wide.
 *
 * Renders nothing at all until NEXT_PUBLIC_META_PIXEL_ID is set, so local
 * development and any deploy made before the Pixel exists stay clean — no failing
 * requests to connect.facebook.net, no console noise.
 *
 * `afterInteractive` rather than `beforeInteractive`: the Pixel is not needed to
 * paint the page, and loading it early would push a third-party script in front of
 * the hero image on the very mobile connections the ads are aimed at. PageView
 * lands a few hundred milliseconds later, which Meta does not care about.
 */
export default function MetaPixel() {
  if (!pixelEnabled) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${metaPixelId}');
fbq('track','PageView');`}
      </Script>

      {/*
        The no-JavaScript fallback Meta's own setup flow generates. It records a
        PageView for visitors whose browser ran no script at all — rare, but this
        is one <img> and it is what Events Manager checks for when it verifies the
        Pixel is installed correctly.
      */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
