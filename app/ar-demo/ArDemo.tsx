'use client'

import Image from 'next/image'
import { useState } from 'react'
import PageShell from '@/components/PageShell'
import RugAr, { type ArRug } from '@/components/RugAr'

/**
 * The three rugs here are not a random sample. Each one stands for a different kind of
 * source photograph in the catalogue, because how a rug was photographed decides
 * whether it can have AR at all.
 */
const RUGS: (ArRug & { photo: string; source: string; note: string })[] = [
  {
    code: 'VLR-121',
    name: 'Afreen',
    size: '5 × 8 ft',
    photo: '/images/rugs/vlr-121-afreen.jpg',
    source: 'Already flat',
    note:
      'The Topshot photographs — VLR-121 to VLR-127 — were shot straight down and fill the frame. They need no correction at all, so the texture is the photograph. This is the best quality AR can give.',
  },
  {
    code: 'VLR-206',
    name: 'Red and green floral',
    size: '5 × 8 ft',
    photo: '/images/catalogue/vlr-206.jpg',
    source: 'Corrected automatically',
    note:
      'Shot at an angle on the warehouse floor, like the other 88 in the Full Range. The four corners were found automatically and the perspective undone. Look closely at the far end of the border and it is a touch softer than the near end — that is the stretch, and it is the honest cost of not reshooting.',
  },
  {
    code: 'VLR-244',
    name: 'Faded abstract',
    size: '5 × 8 ft',
    photo: '/images/catalogue/vlr-244.jpg',
    source: 'Corrected automatically',
    note:
      'A second Full Range rug, included because a busy pattern hides warping and a plain one does not. This one is deliberately quiet, so any error in the correction would be obvious.',
  },
]

export default function ArDemo() {
  const [open, setOpen] = useState<ArRug | null>(null)

  return (
    <>
      <PageShell
        title="See it in your room"
        intro="A prototype. Three rugs, each turned into a true-to-size 3D model from the photographs already in the catalogue — no new photography. Open one on a phone to place it on your own floor."
      >
        <div className="ar-demo-grid">
          {RUGS.map((rug) => (
            <article className="ar-demo-card" key={rug.code}>
              <div className="ar-demo-shot">
                <Image
                  src={rug.photo}
                  alt={`${rug.name}, as originally photographed`}
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                  loading="lazy"
                />
              </div>
              <div className="ar-demo-body">
                <span className="num">{rug.code}</span>
                <h3>{rug.name}</h3>
                <span className="ar-demo-tag">{rug.source}</span>
                <p>{rug.note}</p>
                <button
                  type="button"
                  className="cta-btn"
                  onClick={() => setOpen(rug)}
                >
                  See it in your room
                </button>
              </div>
            </article>
          ))}
        </div>

        <h2>What to look for</h2>
        <ul>
          <li>
            <strong>On an iPhone or iPad</strong>, tap &ldquo;View in your room&rdquo;
            and Safari hands off to AR Quick Look. Point the camera at the floor, and
            the rug lands at its real size — 5 × 8 ft. Walk around it.
          </li>
          <li>
            <strong>On Android</strong>, the same button opens WebXR or Google&rsquo;s
            Scene Viewer, from the same model.
          </li>
          <li>
            <strong>On a desktop</strong>, there is no camera to use, so you get the 3D
            view instead — drag to turn the rug and watch the light move across the
            pile.
          </li>
          <li>
            <strong>Size is fixed on purpose.</strong> Pinch-to-resize is disabled. A
            rug shown at the wrong size answers the customer&rsquo;s question wrongly,
            which is worse than not answering it.
          </li>
        </ul>

        <h2>What this prototype does not yet settle</h2>
        <ul>
          <li>
            <strong>Only one size.</strong> Every model here is 5 × 8 ft, the
            most-ordered size. Offering the other eight means either more files or
            building them on demand — a decision, not a difficulty.
          </li>
          <li>
            <strong>The 20 curated rugs are the hard ones.</strong> Their photographs
            are styled room shots, and several crop the rug at the frame edge. What is
            not in the photograph cannot be recovered from it, so some of those will
            need reshooting rather than correcting.
          </li>
          <li>
            <strong>Weight.</strong> Each rug is roughly 400 kB per format, and the
            viewer script is another 1 MB. Nothing loads until someone asks for AR, but
            110 rugs is a lot of files to keep in the repository.
          </li>
        </ul>
      </PageShell>

      {open && <RugAr rug={open} onClose={() => setOpen(null)} />}
    </>
  )
}
