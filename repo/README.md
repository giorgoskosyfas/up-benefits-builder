# Up Benefits Builder

A bilingual (Greek / English) guided quiz that takes an HR manager or CFO from “I’m curious” to a tailored Up Hellas benefits package in under two minutes, and hands Sales a qualified, enriched lead.

> **Concept prototype for the Up Hellas “Web & Agentic AI Specialist” take-home assessment.** Not an official Up Hellas page. Dummy data only. No official pricing or tax figures are used anywhere.

**Live:** https://giorgoskosyfas.github.io/up-benefits-builder/ (EL) · https://giorgoskosyfas.github.io/up-benefits-builder/en/ (EN)

## Deliverables

* **Write-up (1 page):** `docs/writeup.pdf` · **Technical appendix** (events table, funnel, routing, SEO / AI search, PageSpeed): `docs/appendix.pdf`
* **Video walkthrough (3:20, captioned):** `docs/walkthrough.mp4`
* **Screenshots:** `docs/screenshots/`: n8n workflows, Google Sheet with routed leads, GA4 Realtime, GTM tags, mobile and desktop UI
* **Workflow exports (no credentials):** `n8n/*.workflow.json` · **GTM container export:** `gtm/GTM-UBB-container-import.json`

## Why Webflow + custom code

uphellas.gr is built on Webflow, so the app ships as a framework-free component that drops into any Webflow page with one Code Embed (`webflow/embed.html`). The free Webflow Starter plan locks Code Embed and custom head code, so the live demo is hosted as a static site on GitHub Pages. That also gives full control over hreflang, canonical tags, structured data and Core Web Vitals. On a paid Site plan, the same embed goes into a CMS-driven Webflow page.

## What’s in the repo

| Path | What it is |
|---|---|
| `index.html`, `en/index.html` | SEO landing pages (meta, Open Graph, hreflang, JSON-LD: WebPage, WebApplication, FAQPage, BreadcrumbList), built by `tools/build.py` |
| `assets/ubb.js` | The app: zero-dependency vanilla JS, about 15 KB gzipped. Product catalogue config, 7-step quiz, rules engine, lead gate, AI summary client with fallback, share card, dataLayer events |
| `assets/ubb.css` | Scoped styles (`.ubb`), safe to drop into a Webflow page |
| `n8n/ubb-ai-summary.workflow.json` | n8n workflow: guardrailed Gemini summary (enum whitelist → fixed catalogue prompt → JSON schema → validator → fallback) |
| `n8n/ubb-lead-routing.workflow.json` | n8n workflow: validate and enrich → free-email flag → AI classification → score and route → Google Sheet → Gmail alert for high priority |
| `n8n/sheet-headers.csv` | Header row for the Leads Google Sheet |
| `gtm/GTM-UBB-container-import.json` | GTM container export: Google tag + one dynamic GA4 event tag + 18 data-layer variables |
| `webflow/embed.html` | Snippet to embed the app in any Webflow page |
| `tests/` | Rules-engine test across 315,000 answer combinations, n8n code-node guardrail tests, Playwright end-to-end test |

All credentials were removed from the exported workflows. They reference credential *names* only.

## Architecture

```
Browser (Webflow / static page)
  ├─ ubb.js: rules engine picks the products (deterministic, explainable)
  ├─ dataLayer → GTM → GA4 (quiz_start, quiz_step_complete, quiz_complete, generate_lead, quiz_drop_off, share_result, demo_click)
  ├─ POST /webhook/ubb-summary ──► n8n ─► Gemini (structured JSON) ─► validator ─► summary or fallback
  └─ POST /webhook/ubb-lead ─────► n8n ─► enrich + free-email flag ─► Gemini classify ─► score/route ─► Google Sheet ─► Gmail (high only)
```

* The API key lives only in n8n credentials. The browser never sees it.
* Requests use `Content-Type: text/plain`, so there is no CORS preflight. n8n answers with `Access-Control-Allow-Origin`.
* The AI summary is prefetched when the quiz ends, so it is usually ready by the time the lead form is submitted.
* Results never wait on the CRM: the lead is fired, then results render.

## Run locally

```bash
python3 tools/build.py --base http://localhost:8080 --summary <n8n-summary-url> --lead <n8n-lead-url>
python3 -m http.server 8080
```
With no endpoints the app runs in demo mode (deterministic summary, lead logged to console).

## Tests

```bash
node tests/rules.test.js          # 315,000 combinations: every result has a core product + reasons; fallback passes guardrails
node tests/n8n_code.test.js       # guardrail rejections (numbers/€, other products, competitors, wrong language, LLM error) + routing
python3 tests/e2e.py              # Playwright: both languages × mobile/desktop, validation, back, gate, events
```

## AI tools used

I used Claude as a coding assistant for drafting code, n8n workflows, copy and tests, and for browser automation during setup. I set up and own all the accounts, credentials and integrations, and I reviewed and tested every output.
