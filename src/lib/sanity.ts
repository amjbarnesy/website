import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// projectId/dataset are public identifiers (not secrets), so they default to the
// adambarnes-blog project — env vars can still override for other environments.
export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID ?? '03e66gen',
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  // Build-time only: fetch from the live API (not the cached CDN) so each build
  // always captures the newest published content. A webhook-triggered rebuild
  // right after publishing must not read a stale CDN copy.
  useCdn: false,
});

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: SanityImageSource) => builder.image(source);
