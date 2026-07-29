import type { BackgroundStyle } from "@/lib/hytale-types";

/** Per-edge inset, in pixels, for a 9-slice background. */
export interface NineSliceInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Resolves the 9-slice insets declared on a background, or null when the
 * texture should simply be stretched.
 *
 * Hytale offers three knobs and they compose:
 *   Border            all four edges
 *   HorizontalBorder  overrides left and right
 *   VerticalBorder    overrides top and bottom
 *
 * A file may set only HorizontalBorder — TopBar/Background.png does exactly
 * that — so the horizontal and vertical axes are resolved independently rather
 * than requiring `Border` to be present.
 */
export function nineSliceInsets(
  background: BackgroundStyle,
): NineSliceInsets | null {
  const { border, horizontalBorder, verticalBorder } = background;

  const horizontal = horizontalBorder ?? border;
  const vertical = verticalBorder ?? border;

  if (horizontal === undefined && vertical === undefined) return null;

  const h = Math.max(0, horizontal ?? 0);
  const v = Math.max(0, vertical ?? 0);

  // All zero means "no slicing"; stretching is the correct rendering.
  if (h === 0 && v === 0) return null;

  return { top: v, right: h, bottom: v, left: h };
}
