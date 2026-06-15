import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// projectId/dataset are public identifiers (not secrets), so they default to the
// adambarnes-blog project — env vars can still override for other environments.
export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID ?? '03e66gen',
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: SanityImageSource) => builder.image(source);
