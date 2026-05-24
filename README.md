# Yellowsky

Art prints and sketches by András Dénes. A creative journey that started during lockdown.

## Development

```bash
npm install
npm run dev
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Hosting:** Vercel
- **Payments:** Stripe (planned)
- **Style:** Light theme with accent color #ffcb2a
- **Typeface:** Outfit (display), Inter (body)

## Pages

- `/` — Homepage with story
- `/webshop` — Print shop (coming soon)
- `/contact` — Contact form

## Related

- [andrasdenes.com](https://andrasdenes.com) — Main website
- [#yellowskychallenge](https://instagram.com/explore/tags/yellowskychallenge) — Instagram hashtag

## TODO

- [ ] URL lang param — Accept `?lang=en` or `?lang=hu` to pre-set site language (for marketing links)
- [ ] Canvas preview - artwork preview on canvas element before purchase
- [ ] SEO - meta tags, Open Graph, structured data for artwork pages
- [ ] Marketing - social sharing, email notifications, promotional campaigns
- [ ] "New" badge - heartbeat animation for artworks uploaded <5 days ago
  - Use S3 `LastModified` timestamp
  - Pulse animation ~1.5s cycle
  - See `clawledge/days/YYYY-MM-DD/yellowsky.md` for detailed plan