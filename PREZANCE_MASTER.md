# PREZANCE — MASTER PROJECT FILE
## Digital Presence Agency | Amman, Jordan
*Last updated: June 11, 2026*

---

## WHAT IS PREZANCE

A productised digital presence agency serving professionals and businesses in Jordan and the Gulf. Low-maintenance, template-driven delivery. Secondary project — Clinaid is primary focus.

**Tagline:** "Your presence, perfected."
**Position:** Premium AI-powered digital agency, Amman Jordan
**Identity rule:** Standalone brand — no connection to Dr. Motaz publicly

---

## BRAND IDENTITY

| Element | Value |
|---------|-------|
| Domain | prezance.co |
| Email | hello@prezance.co (forwards to melhemmotaz@gmail.com) |
| Primary | Black #000000 |
| White | #FFFFFF |
| Grey | #888888 |
| Accent | subtle grey tones |
| Heading font | Inter (same as Vercel) |
| Body font | Inter |
| Design reference | Vercel.com |
| Chatbot name | Prezi (powered by Typebot + DeepSeek) |

---

## INFRASTRUCTURE

| Item | Value |
|------|-------|
| Hosting | GitHub Pages (free, already set up) |
| DNS | Cloudflare (prezance.co active) |
| GitHub | github.com/melhemmotaz/prezance-website |
| Chatbot | Typebot self-hosted on Oracle VM (132.145.42.145) |
| Chatbot AI | DeepSeek V4 Flash via DeepInfra |
| Lead notification | WhatsApp webhook from Typebot |
| Formspree | mgorjvkk (contact form backup) |

---

## SERVICES — FINAL LIST

| Service | Price |
|---------|-------|
| Professional Website (Starter) | $250 |
| Professional Website (Standard) | $500 |
| Professional Website (Premium) | $900 |
| Mobile App | $1,500+ |
| AI Chatbot | $200 |
| Booking System | $150 |
| Digital Menu | $150 |
| Google Business Profile + SEO Setup | $100 |

---

## WEBSITE ARCHITECTURE

### Pages
- `index.html` — single long scrolling homepage
- `templates/index.html` — full template gallery browser
- `templates/[name]/index.html` — 15 individual template previews

### Homepage Sections (order)
1. Hero — Stripe wave animation + bold headline + CTA
2. Bento grid — services displayed editorially (NO service cards)
3. Template showcase — 3D rotating carousel of 15 templates
4. How it works — 3 steps, full-width typography
5. Pricing — clean table, no cards
6. Animated stats — websites built, industries, delivery time
7. Contact CTA — Typebot chatbot + email

### Design Rules
- Vercel colours: black #000000, white #FFFFFF, grey tones
- NO service cards (typical AI website pattern — avoid)
- NO Arabic content — English only
- Bento grid for services — asymmetric, editorial
- Full-width statement rows where possible
- Stripe wave animation on hero (HuggingFace JS file)
- 3D CSS carousel for template gallery

---

## TEMPLATE GALLERY — 15 TEMPLATES

### Already downloaded (in Clinaid repo)
Location: `/Users/motazmelhem/Developer/Clinaid/doctor/website-templates/`

| # | Name | Style | Path |
|---|------|-------|------|
| 1 | Novena | Clinical Authority | novena/source/index.html |
| 2 | Medic | Warm & Elegant | medic/source/index.html |
| 3 | MediLab | Modern Minimal | medilab/index.html |
| 4 | MediCio | Dark Premium | medicio/index.html |
| 5 | Klinik | Soft & Caring | klinik/index.html |

### Still needed (10 more)
Categories: Legal (2-3), Restaurant (2-3), General Business (2-3), Fitness/Wellness (1-2)
Source: GitHub free MIT-licensed HTML templates
To be found and downloaded in a future session.

---

## CHATBOT — TYPEBOT SETUP

- Self-hosted on Oracle VM: 132.145.42.145
- Docker deployment (alongside n8n and clinaid-bot)
- AI: DeepSeek V4 Flash via DeepInfra (OpenAI-compatible endpoint)
- System prompt: Prezance services expert, lead qualification
- Flow: Answer questions → detect buying intent → collect lead (name, business, phone, budget) → WhatsApp notification
- NOT YET BUILT — pending session

---

## WAVE ANIMATION

Source: HuggingFace reverse-engineered Stripe gradient
JS file: single file, no npm, no build step
Colours for Prezance: ['#000000', '#111111', '#222222', '#333333'] — subtle dark waves
Usage: `new Gradient({ canvas: '#hero-canvas', colors: [...] })`

---

## BUSINESS MODEL

Productised service — fixed packages, templated delivery.
Clients contact via Typebot → lead captured → delivered when time permits.
No phone calls. Email + WhatsApp only.
Low maintenance by design — Clinaid is primary focus.

---

## STATUS

| Item | Status |
|------|--------|
| prezance.co domain | ✅ Active (Cloudflare) |
| hello@prezance.co email | ✅ Active (forwards to Gmail) |
| GitHub repo | ✅ Active |
| Railway hosting | ❌ Trial expired — migrating to GitHub Pages |
| Current index.html | ❌ Old design — needs full rebuild |
| Typebot | ❌ Not yet installed |
| New website | ❌ Not yet built |
| Template gallery | ❌ Not yet built |
| 5 medical templates | ✅ Downloaded (in Clinaid repo) |
| 10 other templates | ❌ Not yet found |

---

*Focus: Clinaid first. Prezance is built when time permits.*
*Updated: June 11, 2026*
