'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import RugAr from './RugAr'
import WhatsAppCta from './WhatsAppCta'
import WhatsAppIcon from './WhatsAppIcon'
import { techniqueByName } from '@/data/craft'
import type { RugView } from '@/data/rugs'
import { rugSizes, sizeRange } from '@/data/sizes'
import { publicUrl } from '@/lib/site'
import { rugMessage } from '@/lib/whatsapp'

/**
 * The body of a rug's page: photographs on the left, everything you can act on
 * on the right.
 *
 * Client-side because of the photo switcher and the AR sheet. The absolute URL is
 * passed in rather than computed here — it comes from siteUrl() on the server, which
 * reads env this component cannot see, and the WhatsApp link needs it to be absolute
 * or the preview card never renders.
 */
export default function RugDetail({ rug, url }: { rug: RugView; url: string }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [arOpen, setArOpen] = useState(false)

  /*
    The link that goes into the WhatsApp message, corrected in the browser.

    `url` is built at BUILD time from siteUrl(), and that is the best the server can do
    — but it is only as right as the environment the build ran in. A build with neither
    NEXT_PUBLIC_SITE_URL nor VERCEL_URL set bakes `http://localhost:3000` into all
    hundred and twelve pages, and every customer who tapped "Enquire on WhatsApp" would
    send the studio a link to their own machine. A build on Vercel without the public
    variable bakes the deployment hostname rather than the real domain, which works but
    ages badly.

    The browser always knows the answer. Starting from the server value keeps the first
    render identical on both sides, so there is no hydration mismatch, and the effect
    replaces it before anyone can click.
  */
  const [shareUrl, setShareUrl] = useState(url)
  useEffect(() => setShareUrl(publicUrl(rug.href)), [rug.href])

  const photo = rug.photos[photoIndex] ?? rug.photos[0]!
  const technique = rug.weave ? techniqueByName(rug.weave) : undefined

  return (
    <>
      <div className="rug-detail">
        <div className="rug-detail-media">
          <div className="rug-detail-shot">
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
              priority
            />
          </div>

          {rug.photos.length > 1 && (
            <div className="rug-detail-thumbs">
              {rug.photos.map((item, index) => (
                <button
                  type="button"
                  key={item.src}
                  className={`rm-thumb${index === photoIndex ? ' is-active' : ''}`}
                  onClick={() => setPhotoIndex(index)}
                  aria-label={
                    index === 0
                      ? `Show ${rug.name} on its own`
                      : `Show ${rug.name} in a room, photo ${index} of ${rug.photos.length - 1}`
                  }
                  aria-pressed={index === photoIndex}
                >
                  <Image src={item.src} alt="" fill sizes="72px" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rug-detail-body">
          <div className="rm-eyebrow">{rug.category}</div>
          <div className="rm-code">{rug.code}</div>
          <h1>{rug.name}</h1>
          <p className="rm-desc">{rug.description}</p>

          <dl className="rm-specs">
            {/*
              Only what is actually known. Eighty-nine of these rugs have no spec sheet
              yet, and printing "Weave: —" on their pages would look like a shop that
              has lost its own paperwork. A rug with nothing to declare shows the sizes
              row alone, which is true for every rug we make.
            */}
            {rug.weave && (
              <div>
                <dt>Weave</dt>
                <dd>{rug.weave}</dd>
              </div>
            )}
            {rug.materials?.length ? (
              <div>
                <dt>Yarn</dt>
                <dd>{rug.materials.join(' · ')}</dd>
              </div>
            ) : null}
            <div>
              <dt>Sizes</dt>
              <dd>{sizeRange}, or custom</dd>
            </div>
            <div>
              <dt>Made</dt>
              <dd>To order, in Bhadohi &amp; Mirzapur</dd>
            </div>
          </dl>

          {technique && <p className="rm-technique">{technique.detail}</p>}

          <div className="rm-actions">
            {/*
              The WhatsApp message now carries this page's URL, so the studio sees the
              rug as a preview card in the thread instead of a bare code. See
              lib/whatsapp.ts for why it is a link and not an attachment.
            */}
            <WhatsAppCta
              className="cta-btn wa-btn"
              message={rugMessage(rug.name, rug.code, shareUrl)}
              contentId={rug.code}
              contentName={rug.name}
              contentCategory={rug.category}
              aria-label={`Enquire on WhatsApp about ${rug.name}`}
            >
              <WhatsAppIcon size={17} />
              Enquire on WhatsApp
            </WhatsAppCta>

            {rug.ar && (
              <button type="button" className="rm-link" onClick={() => setArOpen(true)}>
                See it in your room
              </button>
            )}

            <Link href="/#enquire" className="rm-link">
              Or send an enquiry form
            </Link>
          </div>

          {rug.story?.length ? (
            <div className="rug-story">
              {rug.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          <details className="rug-sizes">
            <summary>Size guide — which size fits your room</summary>
            <ul>
              {rugSizes.map((size) => (
                <li key={size.feet}>
                  <strong>{size.feetLong}</strong> <span className="num">{size.cm}</span>
                  <em>{size.room}</em>
                  <span>{size.note}</span>
                </li>
              ))}
            </ul>
            <p>
              Nothing here the right shape? Every rug is woven to order, so we can make
              this one to your measurements — send us the room and we will advise.
            </p>
          </details>
        </div>
      </div>

      {arOpen && rug.ar && (
        <RugAr rug={{ code: rug.code, name: rug.name }} onClose={() => setArOpen(false)} />
      )}
    </>
  )
}
