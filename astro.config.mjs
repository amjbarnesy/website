// @ts-check
import { defineConfig } from 'astro/config';

// Pure static output. build.format 'file' keeps the existing URL scheme
// (/about.html, /web-design.html, etc.) so canonicals, internal links and the
// sitemap stay valid. No SSR adapter — the only dynamic bit, the contact form,
// is a standalone Vercel serverless function in /api/contact.ts, which Vercel
// deploys automatically next to the static build (and which keeps these URLs
// intact, unlike the Astro Vercel adapter which forces directory URLs).
export default defineConfig({
  site: 'https://www.adambarnes.biz',
  build: {
    format: 'file',
  },
});
