# Prompt for Claude Code

Copy everything below the line into Claude Code, in the same folder where you've saved `velora-living-website.html`.

---

I have a single-file static HTML website for my rug brand, Velora Living, at `./velora-living-website.html`. It's fully designed (colors, type, layout, copy, product images embedded as base64) — I don't want the visual design changed. Your job is to turn it into a real, deployable, full-stack website.

## 1. Project setup
- Convert this into a **Next.js 14 (App Router) + TypeScript + Tailwind CSS** project.
- Rebuild every section of the existing HTML as React components with the same layout, spacing, colors, type, copy, and scroll/reveal animations — pixel-match the current design, don't redesign it.
- Extract every base64 image embedded in the HTML into real files under `/public/images/`, name them sensibly (e.g. `rugs/rose-meadow-room.jpg`), and reference them with `next/image` for automatic optimization (responsive sizes, lazy loading, WebP/AVIF).
- Move all rug product data (code, name, collection, description, materials, image paths) out of the markup into a single structured file, `/data/products.ts` (or a small SQLite/Postgres table if you set up a database per section 3) — I want to be able to add or edit a rug later without touching component code.

## 2. Backend functionality
Add real server-side functionality using Next.js API routes / Route Handlers:

- **Enquiry form**: Every "Enquire Now" / "Enquire About This Rug" button and the footer contact area should open or scroll to a real contact form (name, email, phone optional, message, and — when triggered from a specific rug — a hidden field with that rug's code/name). On submit:
  - Validate on both client and server.
  - Store the enquiry in a database (see section 3).
  - Send a notification email to the business owner and an auto-reply confirmation email to the customer, matching the site's tone (warm, understated, on-brand).
  - Show a proper success/error state in the UI (no jarring browser alerts).
  - Add basic spam protection (honeypot field is fine, plus simple rate limiting).
- **Newsletter signup**: The newsletter form should actually submit — store the email (with timestamp, dedupe on email) and send a short welcome email.
- **Admin view** (simple, password-protected via a single env-var credential is fine — no need for full auth/roles): a `/admin` page listing enquiries and newsletter signups with basic filtering by date, so I can check submissions without a database GUI.

## 3. Data & email setup
- Use **SQLite via Prisma** for local dev, structured so it's a one-line swap to Postgres in production (e.g. Vercel Postgres or Supabase) — set this up with Prisma from the start so both work.
- Use **Resend** for transactional email (enquiry notification, auto-reply, newsletter welcome). If you'd rather use Nodemailer with SMTP instead, that's fine — just make it configurable via environment variables either way.
- Create a `.env.example` listing every required variable (database URL, email API key, admin password, site URL, etc.) with comments explaining each one.

## 4. SEO & polish
- Add proper metadata (title, description, Open Graph tags with a real preview image, favicon derived from the Velora Living monogram).
- Add `sitemap.xml` and `robots.txt`.
- Preserve all existing alt text on images; add any that's missing.
- Keep the visible keyboard focus states and aria-labels already in the markup.
- Run a Lighthouse pass and fix anything scoring below ~90 on Performance/Accessibility/SEO/Best Practices.

## 5. Testing
- Verify the enquiry form and newsletter form actually send email and write to the database in local dev before moving to deployment.
- Test on mobile widths (the original has a mobile menu and responsive grid — make sure it still works identically).

## 6. Deployment
- Deploy the finished app to **Vercel**.
- Set up the production database (Vercel Postgres or Supabase — your call) and run migrations against it.
- Add all required environment variables in the Vercel project settings.
- Give me the final steps to connect a custom domain once I buy one.
- At the end, give me a short README covering: how to run locally, how to add a new rug to the catalog, how to check enquiries/newsletter signups, and how to redeploy after changes.

## Notes
- This is a lead-generation / lookbook site, not e-commerce — no cart or checkout needed. The goal of the backend is just to capture and respond to enquiries and newsletter signups reliably.
- The brand is online-first and leans on Instagram (@veloraliving) — keep that CTA prominent, don't remove it.
- Ask me before making any visual/design changes beyond what's needed for the React conversion.
