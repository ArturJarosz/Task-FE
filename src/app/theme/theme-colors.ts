import {palette} from '@primeng/themes';

// Brand color as stored in the "Theme color" system parameter; the backend seeds it with this default
export const THEME_COLOR_PARAMETER = 'Theme color';
export const DEFAULT_BRAND_COLOR = '#465fff';

export const BRAND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type BrandPalette = Record<(typeof BRAND_SHADES)[number], string>;

// Text on brand surfaces is either white or the darkest grey, whichever reads better
const LIGHT_TEXT = '#ffffff';
const DARK_TEXT = '#101828';

// WCAG minimum for large text and UI parts; brand-500 is used for links and icons on white cards
export const MIN_BRAND_CONTRAST = 3;
// Card surface in light mode; dark mode shows a lighter shade of the brand on dark cards, so light mode is the strict case
const LIGHT_SURFACE = '#ffffff';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string | null | undefined): value is string {
    return !!value && HEX_COLOR.test(value);
}

export function normalizeHexColor(value: string): string {
    let hex = value.trim().toLowerCase();
    return hex.startsWith('#') ? hex : `#${hex}`;
}

// 50-950 scale with the picked color as 500, generated the way PrimeNG generates its own palettes
export function brandPalette(color: string): BrandPalette {
    return palette(color) as unknown as BrandPalette;
}

export function contrastRatio(first: string, second: string): number {
    let [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
}

// Too light to read as links and icons on the cards
export function isLowContrastBrandColor(color: string): boolean {
    return contrastRatio(color, LIGHT_SURFACE) < MIN_BRAND_CONTRAST;
}

export function contrastTextColor(background: string): string {
    return contrastRatio(background, LIGHT_TEXT) >= contrastRatio(background, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT;
}

function relativeLuminance(color: string): number {
    let value = parseInt(color.slice(1), 16);
    let [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(channel => {
        let c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
