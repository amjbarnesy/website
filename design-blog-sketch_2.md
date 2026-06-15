# Design site blog: Sanity schema + Astro routes

Design-and-tech framing baked in. Static output, built from Sanity, rebuild on publish. Zero client JS so the post text is in the raw HTML for SEO and GEO.

---

## For Claude Code: do this first

Before changing any files, create and check out a new branch:

```bash
git checkout -b feat/astro-blog
```

All work in this brief happens on that branch. Do not commit to `main`. Do not merge to `main`. Do not push to `main`. The live site deploys from `main` only, so keeping every commit on `feat/astro-blog` guarantees production stays untouched. When the work is pushed, Vercel builds a separate preview deployment; the live site changes only when a human merges to `main` later.

If the working directory is not a clean checkout of the live site repo, stop and confirm before proceeding.

---

## 0. Packages

Astro side:

```bash
npm install @sanity/client @sanity/image-url @portabletext/to-html
```

Studio side (for the code block type in the body):

```bash
npm install @sanity/code-input
```

Add `codeInput()` to the `plugins` array in `sanity.config.ts`.

Env vars in `.env` (build-time only, no need to expose to the client):

```
SANITY_PROJECT_ID=yourProjectId
SANITY_DATASET=production
```

---

## 1. Sanity schema

Single author (you), so no author schema. Topics are a fixed list, which keeps tagging clean for a solo writer and gives you consistent GEO signals rather than freeform tag sprawl.

### `schemaTypes/post.ts`

```ts
import {defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences. Shown on the list page and used as the meta description, so write it for people and for search.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'topics',
      title: 'Topics',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Design', value: 'design'},
          {title: 'Development', value: 'development'},
          {title: 'Web', value: 'web'},
          {title: 'SEO & GEO', value: 'seo'},
          {title: 'Tools & Workflow', value: 'tools'},
          {title: 'Process', value: 'process'},
          {title: 'Case Study', value: 'case-study'},
        ],
      },
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', title: 'Alt text', type: 'string'}],
        },
        {type: 'code', options: {withFilename: true}}, // needs @sanity/code-input
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'publishedAt', media: 'coverImage'},
  },
})
```

### `schemaTypes/index.ts`

```ts
import {post} from './post'

export const schemaTypes = [post]
```

---

## 2. Sanity client (shared)

### `src/lib/sanity.ts`

```ts
import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'

export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(sanity)
export const urlFor = (source: SanityImageSource) => builder.image(source)
```

---

## 3. Route one: the list page

### `src/pages/blog/index.astro`

```astro
---
import {sanity, urlFor} from '../../lib/sanity'

const posts = await sanity.fetch(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    topics,
    coverImage
  }
`)
---

<!-- Drop this inside your existing layout / shell -->
<main class="blog-index">
  <header>
    <h1>Notes on design and tech</h1>
    <p>Working notes on web design, development, and the craft behind the projects.</p>
  </header>

  <ul class="post-list">
    {posts.map((post) => (
      <li class="post-card">
        {post.coverImage && (
          <a href={`/blog/${post.slug}`}>
            <img
              src={urlFor(post.coverImage).width(800).height(500).fit('crop').url()}
              alt={post.coverImage.alt ?? ''}
              loading="lazy"
              width="800"
              height="500"
            />
          </a>
        )}
        <div class="post-card__body">
          {post.topics?.length > 0 && (
            <p class="post-card__topics">{post.topics.join(' · ')}</p>
          )}
          <h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>
          <p>{post.excerpt}</p>
          <time datetime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </div>
      </li>
    ))}
  </ul>
</main>
```

---

## 4. Route two: the single post

Body is rendered to HTML at build time with `@portabletext/to-html`, so no client JS and the full article text sits in the source.

### `src/pages/blog/[slug].astro`

```astro
---
import {toHTML} from '@portabletext/to-html'
import {sanity, urlFor} from '../../lib/sanity'

export async function getStaticPaths() {
  const slugs = await sanity.fetch(
    `*[_type == "post" && defined(slug.current)].slug.current`
  )
  return slugs.map((slug: string) => ({params: {slug}}))
}

const {slug} = Astro.params
const post = await sanity.fetch(
  `*[_type == "post" && slug.current == $slug][0]{
    title,
    excerpt,
    publishedAt,
    topics,
    coverImage,
    body
  }`,
  {slug}
)

const escapeHtml = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const bodyHtml = toHTML(post.body, {
  components: {
    types: {
      image: ({value}) =>
        `<figure><img src="${urlFor(value).width(1600).url()}" alt="${
          value.alt ?? ''
        }" loading="lazy" /></figure>`,
      code: ({value}) =>
        `<pre data-language="${value.language ?? ''}"><code>${escapeHtml(
          value.code
        )}</code></pre>`,
    },
  },
})

const ogImage = post.coverImage
  ? urlFor(post.coverImage).width(1200).height(630).fit('crop').url()
  : undefined
---

<!-- Set these into your <head>; shown here for reference -->
<title>{post.title}</title>
<meta name="description" content={post.excerpt} />
{ogImage && <meta property="og:image" content={ogImage} />}

<main class="post">
  <article>
    <header>
      {post.topics?.length > 0 && (
        <p class="post__topics">{post.topics.join(' · ')}</p>
      )}
      <h1>{post.title}</h1>
      <time datetime={post.publishedAt}>
        {new Date(post.publishedAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </time>
    </header>

    {post.coverImage && (
      <img
        src={urlFor(post.coverImage).width(1600).url()}
        alt={post.coverImage.alt ?? ''}
        width="1600"
      />
    )}

    <div class="post__body" set:html={bodyHtml} />
  </article>
</main>
```

---

## 5. Publish to live

In Sanity, add a webhook (Manage, API, Webhooks) pointing at a Vercel deploy hook, filtered to `_type == "post"`. On publish, Sanity pings Vercel, Vercel rebuilds, the static post is live a minute or two later. At one post a month this runs about twelve times a year, so build minutes are a non-issue.

---

## 6. Branch and deploy on Vercel

The whole migration happens on a branch, so the live pure-HTML site keeps serving untouched until you deliberately merge. Vercel gives every branch its own preview deployment at a unique URL, fully separate from production.

### Flow

1. Branch off `main` (for example `feat/astro-blog`).
2. Get Astro running locally first with `npm run dev`, so you debug build config on your own machine, not blind on Vercel.
3. Do the work on the branch: migrate the HTML pages, add the blog routes.
4. Push. Vercel builds a preview deployment at its own URL. Production stays on the current version.
5. Test on the preview URL: view source shows post body text, existing pages render correctly.
6. Merge to `main` when happy. Production rebuilds with the Astro version.

### The one wrinkle: the build setting changes

The current site is almost certainly set to "no framework / static" in Vercel's project settings. Astro needs a build step (`astro build`, output `dist`). Vercel usually auto-detects Astro on the preview deploy, but if the preview build fails or serves blank, that project-level build setting is the first thing to check. It is the one thing that is not purely per-branch.

### Two setup items

- Add `SANITY_PROJECT_ID` and `SANITY_DATASET` env vars in Vercel, scoped to both Preview and Production, or it will build locally but fail on Vercel.
- Hold off wiring the publish webhook to the deploy hook until after the merge to `main`, so test publishes do not trigger production rebuilds before you are live.

---

## Build sequence

1. Create the branch (`feat/astro-blog`) and get Astro running locally (`npm run dev`).
2. Add `@sanity/code-input` to the Studio and register `codeInput()`.
3. Add `post.ts`, register it in `schemaTypes/index.ts`, confirm it appears in Studio.
4. Migrate the existing HTML site into Astro (the real work, separate task).
5. Add `src/lib/sanity.ts` and the two routes.
6. Add the env vars in Vercel (Preview and Production).
7. Push, check the preview URL, then merge to `main` when happy.
8. After merge, wire the Sanity webhook to a Vercel deploy hook.
9. Slot styling into your existing CSS (markup above is intentionally unstyled).

## Acceptance criteria

- `/blog` lists published posts, newest first, each linking to its post.
- `/blog/[slug]` renders a full post with body text present in the raw HTML (view source confirms it, not injected by JS).
- Cover image alt text is required and rendered.
- Code blocks and inline images in the body render correctly.
- Meta title, description, and og:image are set per post.
- Publishing in Studio triggers a Vercel rebuild without manual steps.
