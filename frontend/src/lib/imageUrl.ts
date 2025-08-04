/**
 * Image URL helpers for game cards.
 * Builds canonical CDN URLs from game identity while preserving explicit overrides.
 */
import { canonicalizeDeveloper, getCanonicalGameSlug, getOverrideSlugKey, type ProviderId } from './gameSlug';

export type GameIdentity = {
  developer?: string | null;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
};

/**
 * Known explicit overrides where upstream naming differs from our slugification.
 * Key format: `${developer}/${slug}`
 */
const OVERRIDES: Record<string, string> = {
  // kickass
  [getOverrideSlugKey('kickass', 'spacecatka')]: 'spacecatka',
  // cq9 family (canonicalized to cqnine provider id)
  [getOverrideSlugKey('cqnine', 'paradisecq9')]: 'paradisecq9',
};

/**
 * Base CDN builder.
 */
export function buildGameImageUrl(dev: ProviderId, slug: string): string {
  return `https://images.cashflowcasino.com/${dev}/${slug}.avif`;
}

/**
 * Resolve provider id and slug, apply overrides, and return the final URL.
 *
 * The priority for baseName:
 * - explicit game.slug
 * - game.name
 * - game.title
 */
export function getGameImageUrl(game: GameIdentity): string {
  const dev = canonicalizeDeveloper(game.developer);
  if (!dev) return '';

  const baseName = String(
    (game.slug ?? '') ||
    (game.name ?? '') ||
    (game.title ?? '')
  );

  const canonical = getCanonicalGameSlug(baseName);
  const key = getOverrideSlugKey(dev as ProviderId, canonical);
  const finalSlug = OVERRIDES[key] ?? canonical;

  if (!finalSlug) return '';
  return buildGameImageUrl(dev as ProviderId, finalSlug);
}