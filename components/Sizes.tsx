'use client'

import { useState } from 'react'
import Reveal from './Reveal'
import { rugSizes } from '@/data/sizes'
import WhatsAppCta from './WhatsAppCta'
import { sizeMessage } from '@/lib/whatsapp'

/**
 * The size ladder. Chip proportions scale linearly from the smallest rug to the
 * largest, exactly as the original did — but each chip is now a button that opens
 * the measurements, the room it suits, and a to-scale plan against a sofa.
 *
 * Size is the question every rug buyer has, so this is the one place on the page
 * worth being genuinely useful rather than decorative.
 */
const MIN_W = 22
const MAX_W = 68
const MIN_H = 30
const MAX_H = 92

/**
 * The plan diagram represents a fixed room, and every rug is drawn inside it at a
 * single shared scale — that is the only way the sizes stay comparable to each
 * other as you click along the ladder.
 *
 * The room is 17 × 13.6 ft, which is a 5:4 box (matching .sd-plan-inner's
 * aspect-ratio) and leaves a margin around the largest rug, 12 × 15 ft. Because
 * the room's proportions and the box's proportions match, a percentage of the
 * box's width and a percentage of its height mean the same number of feet — so
 * each rug is drawn with its true aspect ratio.
 */
const ROOM_LENGTH_FT = 17
const ROOM_WIDTH_FT = 13.6

/** A standard three-seater, for scale. */
const SOFA_LENGTH_FT = 7
const SOFA_DEPTH_FT = 3
/** How far the sofa's front legs sit onto the rug. */
const SOFA_OVERLAP_FT = 1

/** The rug's centre sits slightly below the middle, leaving room for the sofa. */
const RUG_CENTRE_PCT = 56

export default function Sizes() {
  // 5'x8' is the most-ordered size, so the panel opens on something useful.
  const [selected, setSelected] = useState(3)

  const size = rugSizes[selected]!

  // Everything below is in percentages of the room box, at one shared scale.
  const planW = (size.lengthFt / ROOM_LENGTH_FT) * 100
  const planH = (size.widthFt / ROOM_WIDTH_FT) * 100

  const sofaW = (SOFA_LENGTH_FT / ROOM_LENGTH_FT) * 100
  const sofaH = (SOFA_DEPTH_FT / ROOM_WIDTH_FT) * 100

  // Sit the sofa against the top edge of the rug, overlapping by a foot so it
  // reads as "front legs on the rug" — the placement the copy describes.
  const rugTop = RUG_CENTRE_PCT - planH / 2
  const overlap = (SOFA_OVERLAP_FT / ROOM_WIDTH_FT) * 100
  const sofaTop = Math.max(1, rugTop + overlap - sofaH)

  return (
    <section className="sizes" id="sizes">
      <div className="wrap">
        <Reveal className="sec-head" style={{ marginBottom: 20 }}>
          <div>
            <div className="eyebrow">Available Sizes</div>
            <h2 style={{ fontSize: '1.7rem' }}>A fit for every room</h2>
          </div>
          <p>
            Every design ships in nine standard sizes — or fully custom to your space.
            Choose one to see how it sits in a room.
          </p>
        </Reveal>

        <Reveal className="sizes-row">
          {rugSizes.map((entry, index) => {
            const t = index / (rugSizes.length - 1)
            const width = Math.round(MIN_W + (MAX_W - MIN_W) * t)
            const height = Math.round(MIN_H + (MAX_H - MIN_H) * t)
            const isOn = index === selected

            return (
              <button
                type="button"
                className={isOn ? 'size-chip is-on' : 'size-chip'}
                key={entry.feet}
                onClick={() => setSelected(index)}
                aria-pressed={isOn}
                aria-label={`${entry.feetLong}, ${entry.cm}`}
              >
                <span className="box" style={{ width, height }} aria-hidden="true" />
                <span>{entry.feet}</span>
              </button>
            )
          })}
        </Reveal>

        <Reveal className="size-detail">
          <div className="sd-copy" role="status" aria-live="polite">
            <div className="sd-measure">
              <strong>{size.feetLong}</strong>
              <span>{size.cm}</span>
            </div>
            <div className="sd-room">{size.room}</div>
            <p>{size.note}</p>
            {/* The message names the size, so the studio can answer with a price
                without a round trip. */}
            <WhatsAppCta className="sd-link" message={sizeMessage(size.feetLong)}>
              Ask about this size on WhatsApp
            </WhatsAppCta>
          </div>

          <div className="sd-plan" aria-hidden="true">
            <div className="sd-plan-inner">
              <div
                className="sd-sofa"
                style={{
                  width: `${sofaW}%`,
                  height: `${sofaH}%`,
                  top: `${sofaTop}%`,
                }}
              >
                <span>sofa</span>
              </div>
              <div
                className="sd-rug"
                style={{
                  width: `${planW}%`,
                  height: `${planH}%`,
                  top: `${RUG_CENTRE_PCT}%`,
                }}
              >
                <span>{size.feet}</span>
              </div>
            </div>
            <div className="sd-plan-note">
              Plan view — every size drawn to the same scale
            </div>
          </div>
        </Reveal>

        <Reveal className="custom-note">
          Custom size &amp; shape available on every design — just ask.
        </Reveal>
      </div>
    </section>
  )
}
