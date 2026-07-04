# adambarnes.biz

Astro static site, deployed on Vercel. Blog content ("Thinking") is sourced from
Sanity (project `adambarnes-blog`, dataset `production`).

- Pages: `src/pages/*.astro` (URLs keep the `.html` scheme via `build.format: 'file'`)
- Shared shell/nav/footer: `src/layouts/Base.astro`
- Blog index + post template: `src/pages/blog/`
- Sanity client: `src/lib/sanity.ts`
- Sitemap: `src/pages/sitemap.xml.ts` (regenerated every build; includes all pages
  and every Sanity post)

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
```

## Deployment

Pushing `main` auto-deploys to production via Vercel. Each Vercel deploy also
purges the edge cache, so HTML updates go live immediately.

### llms.txt

`public/llms.txt` is a plain-markdown summary of the site for AI crawlers,
served at `/llms.txt`. There is no automation: bump the `Updated:` date at the
bottom of the file by hand whenever services, pricing anchors or positioning
change, so the summary and its date stay accurate.

## Publishing a blog post triggers a rebuild (Sanity → Vercel)

The site is static, so a **new/edited/deleted Sanity post only appears after a
rebuild.** A Vercel Deploy Hook wired to a Sanity webhook makes every publish
trigger a production rebuild automatically — no manual step, so the blog index
and sitemap can never silently go stale.

`src/lib/sanity.ts` uses `useCdn: false` so each rebuild reads the newest
published content directly from the API, not the cached CDN.

### One-time setup

**1. Create a Vercel Deploy Hook**
Vercel dashboard → this project → **Settings → Git → Deploy Hooks**.
Name it `sanity-publish`, branch `main`, **Create hook**, and copy the URL
(looks like `https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy`).

**2. Create the Sanity webhook**
[manage.sanity.io](https://manage.sanity.io) → project `adambarnes-blog` →
**API → Webhooks → Create webhook**:

| Field | Value |
|---|---|
| Name | `Rebuild site on post change` |
| URL | *(the Deploy Hook URL from step 1)* |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "post"` |
| Projection | *(leave empty)* |
| HTTP method | `POST` |

Save. Now publishing, editing or deleting a post fires the webhook, which calls
the Deploy Hook, which rebuilds and redeploys the site.

### Verifying it works

After publishing a post in Sanity, a new deployment should appear in the Vercel
dashboard within a few seconds. Once it finishes, the post shows on
`/blog.html` and in `/sitemap.xml`.
