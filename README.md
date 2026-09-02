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
9. [Meta ads tracking](#9-meta-ads-tracking)
10. [Still to do](#10-still-to-do)

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
| `NEXT_PUBLIC_META_PIXEL_ID` | your Meta Pixel ID — see [section 9](#9-meta-ads-tracking) |
| `META_CONVERSIONS_API_ACCESS_TOKEN` | your Conversions API token — **secret** |

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

> **The campaign-tracking work added nine columns to `Enquiry`** (`utmSource`,
> `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `fbclid`, `referrer`,
> `landingPage`, and an index on `utmCampaign`). They are all nullable, so applying
> them to a database with existing rows is safe and loses nothing — but they do have
> to be applied before the deploy, or every enquiry submission will fail against the
> old table.

---

## 9. Meta ads tracking

Everything the site needs to run Meta (Facebook / Instagram) ads is wired up. None
of it does anything until you create the Pixel and set two environment variables —
with them unset, no script loads, no events are sent, and the site behaves exactly
as it did before.

### What gets measured

| Event | Fires when | Browser Pixel | Server (Conversions API) |
| --- | --- | --- | --- |
| `PageView` | any page loads | yes | — |
| `ViewContent` | a visitor opens a rug in the quick-view | yes | — |
| `Contact` | a visitor clicks any WhatsApp button | yes | yes |
| `Lead` | an enquiry is stored successfully | yes | yes |

`ViewContent`, `Contact` and `Lead` all carry `content_ids` (the rug code),
`content_name` and `content_category` (Classic Heritage, Modern Heritage, or the
Full Range style), so Meta can report which rugs actually sell.

### Why there are two halves

The browser Pixel alone loses a large share of conversions: iOS App Tracking
Transparency, Safari's tracking prevention, and any ad blocker will stop
`fbevents.js` from ever loading. The Conversions API sends the same event from the
server, where none of that applies.

Both halves send the **same `event_id`** for the same action, which is how Meta
knows they are one conversion and not two. If you ever see conversions doubling in
Events Manager, that is the thing to check first.

Email addresses and phone numbers sent from the server are **SHA-256 hashed**
before they leave the machine. Meta can match them to an account; it never receives
the address itself.

### Setting it up

**1. Create the Pixel.** [Events Manager](https://business.facebook.com/events_manager2)
→ **Connect data sources** → **Web** → **Meta Pixel**. Name it "Velora Living".
The long number under the name is your **Pixel ID**.

**2. Generate the Conversions API token.** In the same dataset: **Settings** →
scroll to **Conversions API** → **Generate access token**. Copy it immediately —
it is shown once. This token can write events into your dataset, so treat it like a
password: Vercel dashboard only, never in a file you commit.

**3. Set the variables** in Vercel → Settings → Environment Variables:

| Variable | Where it comes from | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_META_PIXEL_ID` | Events Manager → your dataset → the ID under the name | no, it is public by design |
| `META_CONVERSIONS_API_ACCESS_TOKEN` | Events Manager → Settings → Conversions API | **yes** |
| `META_TEST_EVENT_CODE` | Events Manager → Test events → the `TEST…` code | no, but remove it before going live |

Redeploy after adding them. `NEXT_PUBLIC_` variables are compiled into the browser
bundle at build time, so an existing deployment will not pick up the Pixel ID until
it is rebuilt.

### Verifying it works

Do this **before** spending anything.

1. In Events Manager, open your dataset → **Test events**. Copy the `TEST…` code
   shown there into `META_TEST_EVENT_CODE` and redeploy.
2. Open the live site. Within a few seconds `PageView` should appear in the Test
   events list.
3. Open a rug → `ViewContent` appears, with the rug code in its parameters.
4. Click any WhatsApp button → `Contact` appears **twice**, once from Browser and
   once from Server, and Meta should label the pair as deduplicated. Two separate
   undeduplicated rows means the `event_id` is not matching.
5. Send a test enquiry → `Lead` appears, same browser/server pair.
6. **Delete `META_TEST_EVENT_CODE` and redeploy.** While it is set, events are
   visible in Test events but are **not** counted towards ad optimisation or
   reporting. This step is easy to forget and expensive to forget.

Two other tools worth knowing:

- The [Meta Pixel Helper](https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
  Chrome extension shows what the browser half is firing, live on the page.
- **Events Manager → your dataset → Overview** shows the event match quality score
  for the server half once real traffic arrives. Anything above about 6 is healthy.

### Which ad produced which lead

Every enquiry stores the campaign it came from. When someone arrives on a link
carrying `utm_` parameters or Meta's `fbclid`, those are captured on the first page
of the session, held in session storage, and written to the database with whatever
they eventually submit. `/admin` shows them on the enquiry card.

First touch wins: someone who arrives from an ad, wanders off and comes back is
still credited to the ad. Tag your ad links like this and the reporting follows:

```
https://veloraliving.com/?utm_source=facebook&utm_medium=paid&utm_campaign=diwali-2026&utm_content=carousel-a
```

### Turning it off

Delete `NEXT_PUBLIC_META_PIXEL_ID` and redeploy. No script loads, no events are
sent, every tracking call becomes a no-op, and nothing else on the site changes.

---

## 10. Still to do

### Before the first ad goes live — things only you can do

None of these are code. In order:

1. **Deploy**, and set `NEXT_PUBLIC_SITE_URL` to the real domain. Everything below
   needs a live HTTPS address.
2. **Create the Pixel** in [Events Manager](https://business.facebook.com/events_manager2)
   and generate the Conversions API token — [section 9](#9-meta-ads-tracking) has
   the click-by-click. Put both into Vercel and redeploy.
3. **Verify the events arrive** using the Test events code, then remove that code.
   Section 9 again. Do not skip this: an untested Pixel usually means an ad account
   optimising against nothing.
4. **Verify your domain** in Business Manager → Brand safety and suitability →
   Domains. Meta requires this before it will let you configure Aggregated Event
   Measurement, which is what makes conversions countable for iOS users.
5. **Configure Aggregated Event Measurement** once the domain is verified: Events
   Manager → Aggregated Event Measurement → Configure Web Events. Rank the events —
   `Lead` first, then `Contact`, then `ViewContent`, then `PageView`. Only the top
   eight count, and you have four.
6. **Run the site through the [Sharing Debugger](https://developers.facebook.com/tools/debug/)**
   and press "Scrape Again". This is what forces Meta to fetch the new Open Graph
   card; without it a previously-shared link keeps showing whatever was cached.
7. **Connect the WhatsApp number** `+91 9879535039` to the Facebook Page:
   Meta Business Suite → Settings → WhatsApp accounts. Click-to-WhatsApp ad
   objectives will not appear until the number is linked to the Page you advertise
   from, and the number must not be signed into WhatsApp Business App and the
   Cloud API at the same time.
8. **Complete Business Verification** (Business Manager → Security Centre) and add a
   **payment method** to the ad account. Both take a day or two to clear and both
   block spending, so start them before you need them.
9. **Check the privacy policy reads true to you.** `/privacy-policy` describes what
   the code actually does, and Meta's ad review will open it. If you change how you
   handle customer data, change that page with it.

### Still open in the code

Things I deliberately left for you rather than inventing:

- **AR — "see it in your room" — is live on 90 of the 112 rugs.**
  A customer opens a rug, picks a size and stands it on their own floor at that size.
  iPhone/iPad use AR Quick Look, Android WebXR or Scene Viewer, desktop an orbitable
  3D view. Models are generated per request by `app/ar/[file]/route.ts` from one
  flattened photograph per rug; nothing but the photograph is committed.

  **Adding a rug** is one command plus one line:

  ```
  python3 scripts/ar/flatten.py public/images/catalogue/vlr-xxx.jpg ar-textures/vlr-xxx.jpg
  npm run ar:check
  ```

  then add the code to `AR_RUGS` in `data/ar.ts`. Add `--flat` if the photograph is
  already straight-on. If detection fails, pass `--corners` by hand and record them in
  `scripts/ar/manual-corners.tsv` (VLR-207 is there as the worked example).

  **`npm run ar:check` is the guard.** It builds every rug at every size and asserts the
  `.usdz` passes `usdchecker --arkit`, that entries are uncompressed and 64-byte aligned
  so Quick Look can memory-map them, and that the vertices are at true metric size.

  **Round and oval rugs are ellipses.** Seven of them. The catalogue calls three "Round"
  and four "Oval", but every photograph shows an ellipse, so they are all modelled that
  way — inscribed in the chosen size, which lets them use the same nine sizes as
  everything else, an oval being sold as width by length like any other rug. The mesh is
  a 96-segment fan (`RIM_SEGMENTS` in `lib/ar/glb.ts`), and the flattener finds them with
  `--shape ellipse`, which fits the rug's principal axes rather than cornering it:
  corner detection lands on four tangent points of an ellipse and shears it into a
  diamond. The background left in the texture's corners is never sampled.

  **The 22 without AR are a photography problem, not a code one.** Sixteen curated rugs
  are styled room shots — the rug sits among furniture and several run off the frame.
  Six catalogue rugs, VLR-268 to VLR-273, were shot at a steep angle on mottled concrete
  with the near edge outside the frame. What was never photographed cannot be recovered;
  these need reshooting, straight down and full-bleed, the way VLR-121 to VLR-127 were.

  **One texture, nine sizes — and what it costs.** The geometry is always true to life,
  so the floor a rug covers is always right. The pattern is an approximation on anything
  but a plain rug: one photograph is stretched to whichever size is picked, so a bordered
  rug at 12x15 shows a border thicker than the one that would be woven. The viewer says
  so, and only for the rugs where it is true — `isPlainRug()` in `data/ar.ts` marks the
  fourteen where it is not. The proper fix is nine-patch scaling, holding the border band
  at a fixed width while the field stretches. That is the next piece of work here.

  Testing needs HTTPS: WebXR and AR Quick Look both refuse plain HTTP, so use a
  deployed URL on a phone rather than localhost. Verified on a real handset.

- **Photographs for the Craftsmanship section** — see [section 2b](#2b-replacing-the-craftsmanship-images).
  This is the main outstanding item.
- **Shipping & Returns, and a Care Guide.** The footer used to carry links to both,
  pointing at `#`. They were removed when the legal row was wired up — a dead link
  in front of paid traffic is worse than no link — and they should come back as
  real pages once the copy exists. The returns terms in particular are a business
  decision, not something to invent: `/terms` currently says only that a custom rug
  cannot be cancelled once weaving has started.
- **The web-app icon is 137 kB.** `public/images/brand/velora-mark-512.png` is
  fetched by every browser that reads the manifest. It is a flat monogram that ought
  to compress to a tenth of that; it needs a proper PNG optimiser (`pngquant`,
  `oxipng`, or Squoosh in the browser), which is not installed here. It loads at low
  priority after everything else, so it costs mobile data rather than page speed.
- **The last 10 Lighthouse points are in the fonts.** Three font files totalling
  172 kB are preloaded alongside the hero image, and they are what keeps LCP above
  2.5 s on a throttled connection. Dropping the preload (`preload: false` on Fraunces
  in `app/layout.tsx`) would hand that bandwidth to the hero image — at the cost of
  the headline briefly rendering in a fallback serif on a slow first load. That is a
  design call, not a technical one, so I have not made it. Say the word either way.
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

**The Meta ads work (section 9):**

- The Pixel injects only when `NEXT_PUBLIC_META_PIXEL_ID` is set: with it unset there
  is no script tag, no `noscript` beacon, and no request to connect.facebook.net.
- With it set, verified against a production build with the Facebook domains blocked
  at the network layer, so nothing left the machine: `init` and `PageView` fire on
  load, `Contact` fires on a WhatsApp click, and `ViewContent` fires **once** per rug
  opened, carrying `content_ids`, `content_name`, `content_category` and
  `content_type`. (In `next dev` it fires twice — React StrictMode double-invokes
  effects in development only. The production build was checked specifically for this.)
- **Deduplication confirmed end to end:** the `eventID` on the browser `Contact` call
  and the `eventId` in the body of the beacon to `/api/track/whatsapp-click` are the
  same UUID.
- `POST /api/track/whatsapp-click` answers 204 for a valid beacon, a malformed body,
  and a body with no `eventId` — it never throws and never blocks the click.
- Enquiry → `Lead`: campaign parameters captured from the URL survive into the
  database. A submission carrying `utm_source=facebook`, `utm_campaign=diwali-2026`,
  `utm_content=carousel-a` and an `fbclid` stored all four against the enquiry, with
  the rug code resolved to its name.
- Rug-code validation still rejects an unknown code (`VLR-999` → 400) across both the
  curated list and the Full Range.

**The WhatsApp CTAs:**

- Six links on the home page plus one per rug modal, each carrying the right
  pre-filled message — general on the hero, header, footer and floating button; the
  rug's name and code on the spotlight and both rug viewers; the selected size on the
  size guide.
- Followed one through to WhatsApp: it opens the real conversation with the message
  already written.

**Forms and states:**

- Empty submit shows all three validation messages and moves focus to the first
  failing field.
- A real submission shows "Sending…" with the button disabled, then the success panel.
- A 500 from the endpoint renders the error banner with `role="alert"` and re-enables
  the button — no silent failure.

**Layout and reliability:**

- Measured under real mobile emulation (Chrome DevTools Protocol, DPR 3, touch on) at
  360 px, 390 px, 640 px and 768 px: **no horizontal overflow at any width**, and the
  burger is 44 x 45 px and on screen at all of them. Below 620 px the header's chat
  button collapses to its icon; the label is clipped rather than removed, so the
  button keeps its accessible name.
- Lighthouse's tap-target audit passes. Controls drawn smaller than 44 px — the
  carousel arrows, filter chips, modal close and paging buttons, footer social icons
  — grow an invisible pseudo-element to the full 44 px on coarse pointers only, so
  nothing about the design moved.
- `/privacy-policy`, `/terms` and the 404 all render, are in the sitemap (the 404 is
  `noindex`), and carry the site's own header and footer.
- Open Graph renders a proper 1200 x 630 landscape card.
- **A correction to an earlier note:** the "Enquire About This Rug" button was
  previously reported as not scrolling to the form. It scrolls correctly. The
  earlier measurement was taken in an automated browser tab that was backgrounded,
  and Chrome does not run smooth-scroll animations in a hidden tab — `document.hidden`
  was `true`, every `behavior: 'smooth'` scroll was a no-op, and every
  `behavior: 'instant'` scroll worked. Nothing in the site was wrong.


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
- Lighthouse **mobile**, production build, median of five runs: **Performance 90,
  Accessibility 96, Best Practices 100, SEO 100**. FCP 0.9 s, Speed Index 0.9 s,
  TBT 0 ms, CLS 0. Performance is bimodal between runs — 90 when LCP lands at 3.6 s,
  81 when it lands at 5.3 s — with byte-for-byte identical network traffic in both
  cases, so the spread is Lighthouse's simulation, not the site. LCP is the hero
  photograph, and what holds it back is the 172 kB of font files preloaded alongside
  it; see "Still to do" for the one lever left. The only remaining accessibility
  finding is the colour contrast noted above.
