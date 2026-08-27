/**
 * The one shared "colorful pastel" surface formula used across every metric,
 * category, and goal card in the app. Cards must read as visibly colored at a
 * glance — not white-with-a-whisper-of-tint. Concept: identity color (~20%) at
 * the top-left, fading through a lighter tint (~10%) to white by the bottom-right.
 */
export function softCardGradient(color: string): string {
  return `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, white) 0%, color-mix(in srgb, ${color} 10%, white) 45%, #FFFFFF 100%)`;
}

/**
 * Tinted icon-container background derived from the identity color.
 * Default ~25% suits a FULL-identity-color glyph on top of it (financial/goal/
 * category cards per this pass). Pass a higher strength only where the glyph
 * itself is a neutral ink color and needs the background to carry more contrast.
 */
export function softIconBackground(color: string, strength = 25): string {
  return `color-mix(in srgb, ${color} ${strength}%, white)`;
}

/** Identity-colored card border — soft, but visibly tinted rather than neutral gray. */
export function softCardBorder(color: string, strength = 22): string {
  return `color-mix(in srgb, ${color} ${strength}%, white)`;
}

/**
 * Stronger variant of softCardGradient for category/budget cards, whose identity
 * colors are already pale pastels (unlike the saturated METRIC_COLORS used by
 * Financial Overview). Same diagonal shape, higher stops, and a tinted — not pure
 * white — end point so the card never fades to "almost white" in its corner.
 */
export function vividCardGradient(color: string): string {
  return `linear-gradient(135deg, color-mix(in srgb, ${color} 30%, white) 0%, color-mix(in srgb, ${color} 16%, white) 55%, color-mix(in srgb, ${color} 8%, white) 100%)`;
}

/**
 * One shared soft-shadow system, tuned to the same ink tone as the existing
 * `.card` utility (see src/index.css) so every surface — old or new — reads as
 * part of one design system. "sm" for compact shapes (category/budget/option
 * cards), "lg" for larger primary cards (Financial Overview metrics aside,
 * think Growing Together, Goal cards).
 */
export function softCardShadow(size: "sm" | "lg" = "sm"): string {
  return size === "lg"
    ? "0 4px 12px rgba(43, 38, 32, 0.05), 0 10px 22px rgba(43, 38, 32, 0.04)"
    : "0 2px 8px rgba(43, 38, 32, 0.04), 0 6px 16px rgba(43, 38, 32, 0.035)";
}
