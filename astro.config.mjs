// @ts-check
import { defineConfig } from 'astro/config';

// Static output. build.format 'file' keeps the existing URL scheme (/about.html,
// /web-design.html, etc.) so canonicals, internal links and the sitemap stay
// valid through the migration. A Vercel adapter gets added later only when the
// contact endpoint (Resend) needs a serverless function.
export default defineConfig({
  site: 'https://www.adambarnes.biz',
  build: {
    format: 'file',
  },
});
