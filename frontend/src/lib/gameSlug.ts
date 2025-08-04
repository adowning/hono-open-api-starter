/**
 * Utilities for canonicalizing developer identifiers and generating game slugs.
 * Focused on predictability and alignment with CDN path expectations.
 *
 * No runtime dependencies. Pure functions for easy unit testing.
 */

export type ProviderId =
  | 'redtiger'
  | 'pragmatic'
  | 'cqnine'
  | 'kickass'
  | (string & {});

/**
 * Conservative game slug generator:
 * - lowercase
 * - trim
 * - remove apostrophes
 * - replace & with "and"
 * - non-alphanumeric to hyphen
 * - collapse multiple hyphens
 * - trim leading/trailing hyphens
 */
export function gameSlug(title: string): string {
  const base = String(title ?? '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base;
}

/**
 * Map common aliases to expected CDN provider folder names.
 */
export function canonicalizeDeveloper(input: string | undefined | null): ProviderId {
  const raw = String(input ?? '').trim().toLowerCase();
  switch (raw) {
    case 'red tiger':
    case 'red-tiger':
    case 'redtiger':
      return 'redtiger';
    case 'pragmatic':
    case 'pragmaticplay':
    case 'pragmatic-play':
      return 'pragmatic';
    case 'cqnine':
    case 'cqnine-games':
    case 'cq-9':
    case 'cq9':
      return 'cqnine';
    case 'kickass':
    case 'kick-ass':
      return 'kickass';
    default:
      return raw as ProviderId;
  }
}

/**
 * If the provided name already looks slug-like, pass it through.
 * Otherwise build one via gameSlug.
 */
export function getCanonicalGameSlug(baseName: string): string {
  const raw = String(baseName ?? '').trim().toLowerCase();
  const slugLike = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw);
  return slugLike ? raw : gameSlug(raw);
}

/**
 * Build the key used for explicit overrides mapping.
 */
export function getOverrideSlugKey(dev: ProviderId, slug: string): string {
  return `${dev}/${slug}`;
}