# Velora Living

The Velora Living website — a lookbook and lead-capture site for handwoven rugs from
Bhadohi & Mirzapur, designed in Jaipur.

Built as **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, with **Prisma** for
data and **Resend** for transactional email. It is a conversion of the original
single-file `velora-living-website.html` (kept for reference in `_original/`), rebuilt
as React components with the design preserved.

---

## Table of contents

1. [Running it locally](#1-running-it-locally)
2. [Adding or editing a rug](#2-adding-or-editing-a-rug)
2b. [Replacing the craftsmanship images](#2b-replacing-the-craftsmanship-images)
3. [Checking enquiries and newsletter signups](#3-checking-enquiries-and-newsletter-signups)
4. [How the project is laid out](#4-how-the-project-is-laid-out)
5. [Email](#5-email)
6. [Deploying to Vercel](#6-deploying-to-vercel)
7. [Connecting a custom domain](#7-connecting-a-custom-domain)
8. [Redeploying after changes](#8-redeploying-after-changes)
9. [Still to do](#9-still-to-do)

---

## 1. Running it locally

You need **Node 18.17 or newer** and a **Postgres database URL**. The project runs
Postgres in both development and production — see the note in `prisma/schema.prisma`
for why. Create a second free database (Supabase or Vercel both allow this) and use
it for local work, so you are never writing test enquiries into live data.

```bash
npm install          # also generates the Prisma client
cp .env.example .env # then paste your dev DATABASE_URL into it
npm run db:push      # creates the tables
npm run dev          # http://localhost:3000
```

Out of the box, with no email API key at all:

- the enquiry and newsletter forms **work end to end** and write to your dev database
- emails are **not delivered**. They are printed to the terminal and written as
  openable HTML files to `.mail-preview/`. This is `EMAIL_PROVIDER=console`.
- `/admin` is reachable with the `ADMIN_PASSWORD` from your `.env`

> The pages themselves render without a database. Only the two forms and `/admin`
> touch it, so you can work on the design with `DATABASE_URL` still unset.

Useful commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint via `next lint` |
| `npm run db:push` | Apply `schema.prisma` to the database |
| `npm run db:studio` | Prisma Studio — a GUI for the database |
| `npm run db:reset` | **Wipes** the database and recreates it empty |

> `npm run db:reset` wipes the tables and recreates them empty — useful after
> testing the forms. It does not ask for confirmation, so never point it at
> production.

---

## 2. Adding or editing a rug

Everything about the catalogue lives in **`data/products.ts`**. No component contains
rug data, so this is the only file you touch.

**To add a rug:**

1. Put the photograph in `public/images/rugs/`, named like the others —
   lowercase, hyphenated, e.g. `vlr-121-dune.jpg`.
2. Add an entry to the `products` array:

```ts
{
  code: 'VLR-121',
  name: 'Dune',
  collection: 'modern',          // 'classic' | 'modern'
  description: 'Soft dunes of ochre and sand, hand-tufted in blended wool.',
  materials: ['Blended Wool'],
  weave: 'Hand Tufted',
  image: '/images/rugs/vlr-121-dune.jpg',
  alt: 'Dune rug styled in a sunlit living room',   // required — never leave empty
  width: 623,                    // the file's real pixel dimensions
  height: 595,
  inGallery: false,              // true to also show it in the "In the Wild" strip
}
```

3. Save. That's it — the rug now appears in its collection, in the enquiry form's rug
   dropdown, and in the page's structured data for search engines.

**The `width` and `height` must match the real file.** `next/image` uses them to
reserve space before the image loads. To check:

```bash
sips -g pixelWidth -g pixelHeight public/images/rugs/vlr-121-dune.jpg
```

**Other things you can change in the same file:**

- `SPOTLIGHT_CODE` — which rug gets the large featured section
- `galleryOrder` — which rugs appear in the "In the Wild" strip, and in what order
- `sizes` — the standard size ladder

The hero stat says "16 signature designs". It is hard-coded in `components/Hero.tsx`;
update it if the count changes.

---

## 2b. Replacing the craftsmanship images

**This is the one thing waiting on you.**

The three technique tiles (Hand Tufted / Hand Woven / Machine Made) currently show
drawn weave diagrams rather than photographs. That is deliberate: the images in the
original file were slices of a brochure screenshot, and there was nothing usable in
them — `machine-made.jpg` and `silk-blend.jpg` were crops of *paragraphs of body
text*, and the other two held about a 105 × 40 px sliver of real photo each.

The four material swatches **are** real photographs of Velora pile, recovered from
those same files and upscaled. Three of them started at roughly 110 px square, so
they are a little soft — worth reshooting when you reshoot the techniques.

### To drop your own photos in

Everything lives in **`data/craft.ts`**. For each technique:

1. Put the photo in `public/images/craft/`
2. Point `image` at it
3. Set `isDiagram: false`
4. Set `width` / `height` to the file's real pixel size
5. Rewrite `alt` to describe the actual photograph

```ts
{
  name: 'Hand Tufted',
  blurb: 'Expertly hand-tufted for rich texture, precision and lasting comfort.',
  image: '/images/craft/hand-tufted.jpg',   // was the .svg diagram
  alt: 'An artisan in Bhadohi driving yarn through the backing with a tufting gun',
  width: 1200,
  height: 1200,
  isDiagram: false,                          // was true
  detail: '…',
}
```

Then delete the `.craft-photo.is-diagram` rule in `app/globals.css` once no
diagrams remain — there is a comment marking it.

**What to shoot.** The tiles are square and render up to about 380 px wide, so aim
for **800 px or more on the short side**. Good subjects, one per technique:

| Tile | What works |
| --- | --- |
| Hand Tufted | A tufting gun against the stretched backing cloth, yarn feeding in |
| Hand Woven | Hands passing weft across a tensioned warp on a pit loom |
| Machine Made | The power loom mid-run, or a finished edge showing the exact repeat |
| Materials | Yarn cones on a creel, raw wool, a close crop of finished pile |

Landscape shots are fine — they get centre-cropped to a square, so keep the subject
near the middle. Daylight beats flash for wool texture.

---

## 3. Checking enquiries and newsletter signups

Go to **`/admin`** and enter your `ADMIN_PASSWORD`. Locally that's
<http://localhost:3000/admin>; in production it's `https://yourdomain.com/admin`.

The admin gives you:

- **Enquiries** — name, email, phone, the rug they asked about, and the message.
  "Reply" opens your mail client with the address filled in. "Mark handled" tracks
  what you have already answered; the counter at the top shows how many are waiting.
- **Newsletter** — every subscriber, when they joined, whether the welcome email went
  out, and whether they have since unsubscribed.
- **Date filters** — last 7 / 30 / 90 days, all time, or an exact from–to range.
  The filter lives in the URL, so you can bookmark a view.

The session lasts a week, then asks for the password again. `/admin` is excluded from
`robots.txt` and carries `noindex`.

There is no user account system — `ADMIN_PASSWORD` is the entire credential, so make
it long and don't reuse it anywhere else.

---

## 4. How the project is laid out

```
app/
  layout.tsx            fonts, metadata, Open Graph
  page.tsx              the homepage, assembled from components/
  globals.css           the site's CSS (see the note at the top of the file)
  icon.svg              favicon, drawn from the Velora monogram
  favicon.ico           …and the raster versions of the same mark
  apple-icon.png
  sitemap.ts            /sitemap.xml
  robots.ts             /robots.txt
  manifest.ts           /manifest.webmanifest
  admin/                password-protected enquiry + subscriber views
  api/
    enquiry/            POST — validate, store, notify, auto-reply
    newsletter/         POST — validate, dedupe, store, welcome
    newsletter/unsubscribe/  GET — one-click unsubscribe (HMAC-signed)
    admin/login|logout/
components/             one file per section of the page, plus:
  RugViewerContext.tsx    which rug the quick-view is showing
  RugModal.tsx            the quick-view dialog itself
  RugModalMount.tsx       loads the dialog on demand, not on page load
  CollectionRow.tsx       carousel row: arrows, drag-to-scroll, progress
  Reveal.tsx              scroll-reveal, backed by one shared observer
  CountUp.tsx             hero stat counter
  ScrollProgress.tsx      hairline progress rule under the header
  BackToTop.tsx           back-to-top button
data/products.ts        the rug catalogue — the only place rug data lives
data/craft.ts           technique + material tiles (see section 2b)
data/sizes.ts           the nine sizes, with measurements and room guidance
lib/
  db.ts                 Prisma client singleton
  email.ts              transport (Resend or console preview)
  email-templates.ts    the three email bodies, HTML + plain text
  validation.ts         Zod schemas shared by client and server
  rate-limit.ts         in-memory fixed-window limiter
  tokens.ts             HMAC signing for sessions and unsubscribe links
  site.ts               brand constants and canonical URL
prisma/schema.prisma    Enquiry and Subscriber models
public/images/          the 30 photographs, extracted from the original HTML
_original/              the single-file site this was converted from
```

### A note on the CSS

The original's hand-tuned CSS was carried over close to verbatim into
`app/globals.css` rather than being rewritten as Tailwind utilities. That was a
deliberate choice: the brief asked for a pixel match, and re-expressing 240 lines of
tuned spacing as utilities is where visual drift creeps in.

Tailwind is fully configured — the brand palette and fonts are in
`tailwind.config.ts` — and it is what the enquiry form, the admin pages and any new
UI are built with. Both approaches coexist; use Tailwind for new work.

### What's interactive

| Where | What it does |
| --- | --- |
| Collection cards, gallery tiles | Open a **quick-view**: large image, code, weave, yarn, size range, and an Enquire button that pre-fills the form with that rug. `←` / `→` page through the row you opened it from, `Esc` closes, focus is trapped and returned. |
| Collections | **Filter** by weave and by yarn, with a live count. Only filters that would match something in that collection are offered. |
| Collection rows | Prev/next **arrows**, **drag-to-scroll**, and a progress bar. Arrows disable at each end; the row resets to the start when a filter changes. |
| Collection tabs | `←` / `→` move between tabs, as a tablist should. |
| Size ladder | Each chip opens the size in **feet and centimetres**, the room it suits, and a **plan diagram drawn to scale** with a three-seater sofa for reference. Every size shares one scale, so they stay comparable. |
| Hero stats | Count up once, when scrolled into view. |
| Page | Gold scroll-progress rule under the header, and a back-to-top button past the fold. |

Everything above honours `prefers-reduced-motion`: transitions are dropped, the
count-up jumps straight to its final value, smooth scrolling becomes instant, and
the progress rule doesn't render at all.

### Spam protection

Both forms carry a honeypot field that is positioned off-screen and hidden from
assistive technology. A submission that fills it gets a normal-looking success
response and is silently discarded, so a bot learns nothing.

On top of that, `lib/rate-limit.ts` caps each IP at 5 enquiries per 15 minutes and 5
newsletter signups per 10 minutes. It is an in-memory limiter, which means each
serverless instance counts separately — enough for the traffic this site will see. If
you ever need it to be strict, swap the `Map` for Vercel KV or Upstash Redis; the
function signature is designed to stay the same.

---

## 5. Email

Three messages are sent:

| When | To | What |
| --- | --- | --- |
| An enquiry arrives | you (`OWNER_EMAIL`) | The full enquiry, with a reply button. `Reply-To` is set to the customer, so hitting reply goes straight to them. |
| An enquiry arrives | the customer | A warm confirmation quoting what they sent, promising a reply within one working day. |
| Someone subscribes | the subscriber | A welcome note with the `WELCOME10` discount code and an unsubscribe link. |

`EMAIL_PROVIDER` picks the transport:

- **`console`** — nothing is delivered. Messages are logged and written to
  `.mail-preview/*.html`. This is the default when `RESEND_API_KEY` is empty.
- **`resend`** — real delivery. The default as soon as `RESEND_API_KEY` is set.

**To start sending for real:**

1. Create an account at [resend.com](https://resend.com).
2. **Domains → Add Domain**, add `veloraliving.com`, and add the DNS records it gives
   you at your registrar. Wait for it to verify.
3. **API Keys → Create**, copy the `re_…` key.
4. Set `RESEND_API_KEY` and change `EMAIL_FROM` to an address at your verified
   domain, e.g. `Velora Living <hello@veloraliving.com>`.

Until the domain is verified you can use `onboarding@resend.dev` as the sender, but
Resend will only deliver to the address that owns the account — fine for testing, not
for customers.

If you would rather use SMTP than Resend, replace the `resend` branch in
`lib/email.ts` with Nodemailer. Everything else — templates, routes, the console
preview mode — stays as it is.

**Email delivery never blocks a lead.** If Resend is down, the enquiry is still saved
to the database and the visitor still sees a success message; the failure is logged.
That is deliberate — a lost lead is worse than a missed notification.

---

## 6. Deploying to Vercel

I built and verified everything locally but could not deploy — that needs your Vercel
account. These are the exact steps.

### 6a. Get the code into Git

```bash
cd /Users/nirmamparikh/Documents/velora_rugs
git init
git add .
git commit -m "Velora Living: Next.js site with enquiry capture and admin"
```

Then create an empty repository on GitHub and push:

```bash
git remote add origin https://github.com/<you>/velora-living.git
git branch -M main
git push -u origin main
```

`.gitignore` already excludes `.env`, `prisma/dev.db`, `.mail-preview/` and
`node_modules`. **Check that `.env` is not in `git status` before you push.**

### 6b. Create the production database

Pick one. Both give you a Postgres connection string.

**Vercel Postgres** — in the Vercel dashboard: **Storage → Create Database →
Postgres**. Attaching it to the project sets `POSTGRES_*` variables automatically;
you still want a plain `DATABASE_URL`, so copy the pooled connection string into a
variable of that name.

**Supabase** — create a project, then **Project Settings → Database → Connection
string → URI**. Use the **connection pooling** URI (port 6543) and append
`?pgbouncer=true&connection_limit=1`, which is what Prisma wants from a serverless
function.

### 6c. Create the tables

Prisma is already set to `postgresql` — there is nothing to switch. You only need to
create the tables in the production database, once, from your machine:

```bash
DATABASE_URL="postgres://…your production URL…" npx prisma db push
```

That reads `prisma/schema.prisma` and creates the `Enquiry` and `Subscriber` tables.

> **On migrations.** This project uses `prisma db push` rather than a migration
> history, which is the right trade for a two-table schema that changes rarely. If
> the schema starts changing regularly and you want versioned migrations, run
> `npx prisma migrate dev --name init` against a database once to start the history,
> commit `prisma/migrations/`, and use `npx prisma migrate deploy` in production
> from then on.

The build itself does **not** need the database — every route that queries Prisma is
`force-dynamic`, so Vercel will build successfully even before you have set
`DATABASE_URL`. It is only the forms and `/admin` that will error until you do.

### 6d. Set the environment variables

In the Vercel project: **Settings → Environment Variables**. Add each of these for
**Production** (and Preview, if you want previews to work):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | your Postgres connection string |
| `RESEND_API_KEY` | your `re_…` key |
| `EMAIL_FROM` | `Velora Living <hello@veloraliving.com>` |
| `OWNER_EMAIL` | the inbox that should receive enquiries |
| `ADMIN_PASSWORD` | a long random password for `/admin` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://veloraliving.com` (no trailing slash) |

`AUTH_SECRET` is **required** in production — the app refuses to start signing
sessions without it, rather than falling back to something insecure.

`.env.example` documents every one of these with comments.

### 6e. Deploy

```bash
npm i -g vercel
vercel login
vercel link      # connect this folder to a Vercel project
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard and it will build on every push.

### 6f. Check it worked

1. Load the site. The hero image and all 16 rugs should appear.
2. Send yourself a test enquiry. Confirm **both** emails arrive — the notification to
   `OWNER_EMAIL` and the auto-reply to the address you used.
3. Sign in to `/admin` and confirm the enquiry is listed.
4. Subscribe with a second address, confirm the welcome email, then click its
   unsubscribe link and confirm the admin shows the subscriber as unsubscribed.

---

## 7. Connecting a custom domain

Once you have bought `veloraliving.com`:

1. Vercel → your project → **Settings → Domains → Add**. Enter `veloraliving.com`.
   Add `www.veloraliving.com` too; Vercel will offer to redirect one to the other —
   pick the bare domain as canonical to match `NEXT_PUBLIC_SITE_URL`.
2. At your registrar, add the records Vercel shows you. Usually:
   - `A` record, host `@` → `76.76.21.21`
   - `CNAME` record, host `www` → `cname.vercel-dns.com`

   Vercel displays the exact values for your project — use those, not these.
3. Wait for DNS to propagate (minutes to a few hours). Vercel issues the HTTPS
   certificate automatically once it resolves.
4. **Update `NEXT_PUBLIC_SITE_URL`** to `https://veloraliving.com` and redeploy. This
   matters: canonical URLs, Open Graph tags, `sitemap.xml` and the unsubscribe links
   in emails are all built from it.
5. Verify the domain in Resend as well (section 5) so email is sent from it.
6. Submit `https://veloraliving.com/sitemap.xml` in Google Search Console.

---

## 8. Redeploying after changes

If the repo is connected to Vercel, pushing is the deploy:

```bash
git add .
git commit -m "Add two rugs to Modern Heritage"
git push
```

Vercel builds and promotes it in a minute or two. Pull requests get their own preview
URL automatically.

Deploying by hand instead:

```bash
vercel --prod
```

**When a change touches `prisma/schema.prisma`**, apply the migration before or
alongside the deploy:

```bash
npx prisma migrate dev --name describe_your_change   # locally, creates the migration
git add prisma/migrations && git commit -m "…" && git push
DATABASE_URL="postgres://…" npx prisma migrate deploy   # applies it to production
```

Adding or editing rugs never touches the schema — that is just `data/products.ts` and
a push.

---

## 9. Still to do

Things I deliberately left for you rather than inventing:

- **Photographs for the Craftsmanship section** — see [section 2b](#2b-replacing-the-craftsmanship-images).
  This is the main outstanding item.
- **The three legal links in the footer** (Privacy Policy, Shipping & Returns, Care
  Guide) still point at `#`, exactly as they did in the original. They need real
  pages, and the copy is a business decision — particularly the returns terms.
- **The Pinterest link** in the footer points at `pinterest.com`. Swap in the real
  profile when there is one, or say the word and I'll remove the icon.
- **A sending domain for email.** Contact details are now Instagram
  [@theveloraliving](https://www.instagram.com/theveloraliving) and
  `parikhnirmam@gmail.com`. Note you *cannot* send as a Gmail address through Resend —
  Gmail's DMARC policy rejects it. Enquiries will reach your inbox either way
  (that's `OWNER_EMAIL`), but the customer auto-reply and newsletter welcome need a
  verified domain before they will deliver to anyone but you. See section 5.
- **Four brand colours fall below the WCAG AA contrast minimum.** These come from the
  original design, so I have not changed them. Measured, with the fix for each:

  | Where | Now | Needs | Suggested |
  | --- | --- | --- | --- |
  | Gold on cream — `.eyebrow`, `Living` under the logo, rug codes | 2.82:1 | 4.5:1 | darken `--gold` to `#856727` (4.66:1) |
  | `.newsletter p` — ink at 75% on gold | 3.79:1 | 4.5:1 | raise to 88% (`#2C261A`, 4.68:1) |
  | `.newsletter-note` — ink at 60% on gold | 2.85:1 | 4.5:1 | raise to 92% (`#262118`, 4.99:1) |

  Darkening `--gold` changes it everywhere it is used, including buttons — worth
  looking at before committing. Say the word and I'll apply whichever you want.
- **The collection tabs and the Subscribe button** now render in Jost rather than the
  browser's default button font. This is Tailwind's Preflight (`button { font-family:
  inherit }`) and it makes them consistent with the rest of the site, but it does
  change their size slightly: the tab row is 6px taller on desktop, and 40px shorter
  on a phone, where Jost is narrow enough that the two tabs no longer wrap onto two
  lines. To restore the original exactly, set `font-family: Arial, sans-serif` on
  `.coll-tab` and `.newsletter-form button` — there is a note in `globals.css`.

### What was verified

- Section geometry compared against the original at 1440px, 768px and 390px. Twelve
  of the fifteen measured blocks — announce bar, header, hero, marquee, spotlight,
  origin, craft, promise, sizes, testimonials, gallery and the hero headline — match
  to the pixel at all three widths. The three that differ are all accounted for: the
  collections and newsletter sections by the button-font change above, and the footer
  by the "Send an Enquiry" button added to its contact column.
- Both forms tested end to end: validation, honeypot, rate limiting, database writes,
  and all three email templates rendered.
- 17 browser interaction tests across tab switching, the rug-specific enquiry flow,
  form validation, the success state, and the mobile menu.
- 36 browser interaction tests across two suites, all passing: tab switching, the
  rug-specific enquiry flow, form validation and success states, the mobile menu,
  plus filters, carousel arrows, the quick-view (open, spec rows, focus handling,
  scroll lock, arrow-key paging, Escape), the gallery lightbox, and the size guide.
- The size-guide plan diagram was checked at all nine sizes: each rug is drawn
  within 0.04 of its true aspect ratio, on one shared scale.
- Lighthouse on a production build, median of three runs: **Performance 91,
  Accessibility 96, Best Practices 100, SEO 100**. Performance ranges 91–93 between
  runs on localhost; the hero image itself transfers in under 10 ms, and what moves
  the number is main-thread time during hydration. The only remaining accessibility
  finding is the colour contrast noted above.
