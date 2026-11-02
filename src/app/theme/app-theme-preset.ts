// App theme v2 — PrimeNG 19 preset ("TailAdmin" style). Rules: DESIGN_GUIDELINES.md
//
// Brand colour (default muted blue #415cc8), TailAdmin greys, soft radii (8px controls and status tags, 16px cards).
// Every PrimeNG component reads these tokens. Change the look HERE, never with ::ng-deep.
//
// Colours are CSS variables from styles.css, never hex values: ThemeService rewrites the brand palette at runtime
// (Settings > Appearance) and <html class="app-dark"> swaps every variable to its dark value. PrimeNG's own dark
// colour scheme is off (darkModeSelector: 'none' in app.config.ts); this light scheme serves both modes.
// If TypeScript flags a component token name, check that component's "Theming" tab in the PrimeNG docs.

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { BRAND_SHADES, BrandPalette } from './theme-colors';

const scale = (variable: (shade: number) => string) =>
  Object.fromEntries(BRAND_SHADES.map(shade => [shade, variable(shade)])) as BrandPalette;

// Raw brand palette, the same in both modes: fills such as primary buttons, with --app-brand-contrast text
const brand = scale(shade => `var(--app-brand-${shade})`);
// Brand as Tailwind's brand-* classes see it: tints and text shades that dark mode adjusts
const brandTint = scale(shade => `var(--color-brand-${shade})`);
// Greys; 0 is the card/control surface
const gray = { 0: 'var(--color-white)', ...scale(shade => `var(--color-gray-${shade})`) };
const white = 'var(--color-white)';
// Status tag fill: the light tint with 8% of the tag's text colour mixed in, so tags stand out on white cards.
// 8% is as far as it goes: on a darker fill the amber text drops below 4.5:1.
const tagFill = (tint: string, text: string) => `color-mix(in srgb, ${text} 8%, ${tint})`;

export const AppThemePreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '6px',
      md: '8px',   // inputs, buttons, selects
      lg: '12px',  // menus, small panels
      xl: '16px',  // cards, dialogs
    },
  },

  semantic: {
    primary: brand,

    // TailAdmin focus: soft 4px brand halo
    focusRing: {
      width: '4px',
      style: 'solid',
      color: 'var(--app-focus-ring)',
      offset: '0',
      shadow: 'none',
    },

    // 40px controls with 16px text (line height fixed at 24px in styles.css)
    formField: {
      paddingX: '0.875rem',
      paddingY: '0.4375rem', // 24px line + 2 x 7px + 2px border = 40px
      borderRadius: '{border.radius.md}',
    },

    colorScheme: {
      light: {
        surface: gray,
        primary: {
          color: brand[500],
          contrastColor: 'var(--app-brand-contrast)',
          hoverColor: brand[600],
          activeColor: brand[700],
        },
        highlight: {
          background: brandTint[50],
          focusBackground: brandTint[100],
          color: brandTint[600],
          focusColor: brandTint[700],
        },
        text: {
          color: gray[800],
          hoverColor: gray[900],
          mutedColor: gray[500],
          hoverMutedColor: gray[600],
        },
        content: {
          background: white,
          hoverBackground: gray[50],
          borderColor: gray[200],
          color: gray[800],
          hoverColor: gray[900],
        },
        formField: {
          background: white,
          borderColor: gray[300],
          hoverBorderColor: gray[400],
          focusBorderColor: brandTint[300],
          invalidBorderColor: 'var(--color-error-600)',
          disabledBackground: gray[50],
          disabledColor: gray[500],
          placeholderColor: gray[400],
          color: gray[800],
          shadow: 'var(--shadow-theme-xs)',
        },
      },
    },
  },

  components: {
    card: {
      root: {
        borderRadius: '{border.radius.xl}',
        shadow: 'none', // cards use a 1px gray-200 border (see .app-card)
      },
      body: { padding: '1.5rem', gap: '1rem' },
      title: { fontSize: '1.25rem', fontWeight: '600' },
    },

    button: {
      root: {
        paddingX: '1rem',
        paddingY: '0.4375rem', // 24px line + 2 x 7px + 2px border = 40px = --spacing-control in styles.css
        borderRadius: '{border.radius.md}',
        iconOnlyWidth: 'var(--spacing-control)', // icon-only buttons are square
        // All buttons share one height: size="small" renders like the default size
        sm: {
          fontSize: '1rem',
          paddingX: '1rem',
          paddingY: '0.4375rem',
          iconOnlyWidth: 'var(--spacing-control)',
        },
      },
      // Outline buttons (severity="secondary" [outlined]="true") get a brand outline and text, so they read as buttons;
      // the solid primary still leads. brand-600 text keeps 4.5:1 with any Theme color.
      colorScheme: {
        light: {
          outlined: {
            secondary: {
              hoverBackground: brandTint[50],
              activeBackground: brandTint[100],
              borderColor: brandTint[300],
              color: brandTint[600],
            },
          },
        },
      },
    },

    // ~700px wide edit dialogs with 32px padding and a 24px title (DESIGN_GUIDELINES.md, "Edit dialog")
    dialog: {
      root: { borderRadius: '24px' },
      header: { padding: '2rem 2rem 1.5rem 2rem', gap: '1rem' },
      title: { fontSize: '1.625rem', fontWeight: '600' },
      content: { padding: '0 2rem 2rem 2rem' },
      footer: { padding: '0 2rem 2rem 2rem', gap: '0.75rem' },
    },

    tag: {
      root: {
        fontSize: '0.875rem',
        fontWeight: '500',
        padding: '0.125rem 0.625rem',
        borderRadius: '{border.radius.md}', // 8px, the same corner as buttons
      },
      // Text one shade darker than TailAdmin's so it passes 4.5:1 contrast
      colorScheme: {
        light: {
          primary: { background: tagFill(brandTint[50], brandTint[600]), color: brandTint[600] },
          info: { background: tagFill(brandTint[50], brandTint[600]), color: brandTint[600] },
          secondary: { background: tagFill(gray[100], gray[700]), color: gray[700] },
          success: { background: tagFill('var(--color-success-50)', 'var(--color-success-700)'), color: 'var(--color-success-700)' },
          warn: { background: tagFill('var(--color-warning-50)', 'var(--color-warning-700)'), color: 'var(--color-warning-700)' },
          danger: { background: tagFill('var(--color-error-50)', 'var(--color-error-700)'), color: 'var(--color-error-700)' },
          contrast: { background: gray[800], color: white },
        },
      },
    },

    // Popup menus (user menu, row ⋯ menus): 12px radius, roomy 14px items, grey hover (TailAdmin dropdown)
    menu: {
      root: { borderRadius: '{border.radius.lg}' },
      list: { padding: '0.5rem', gap: '0.125rem' },
      item: {
        padding: '0.625rem 0.75rem',
        borderRadius: '{border.radius.md}',
        gap: '0.75rem',
        color: gray[700],
        focusColor: gray[800],
        focusBackground: gray[100],
        icon: { color: gray[500], focusColor: gray[700] },
      },
    },

    // Toasts in the status colours, so they also read in dark mode (Aura's own pastels stay light)
    toast: {
      colorScheme: {
        light: {
          info: toastSeverity(brandTint[50], brandTint[600]),
          success: toastSeverity('var(--color-success-50)', 'var(--color-success-700)'),
          warn: toastSeverity('var(--color-warning-50)', 'var(--color-warning-700)'),
          error: toastSeverity('var(--color-error-50)', 'var(--color-error-700)'),
        },
      },
    },

    // The handle stays white, so it stands out on the grey track in both modes
    toggleswitch: {
      colorScheme: {
        light: {
          handle: {
            background: '#ffffff',
            hoverBackground: '#ffffff',
            checkedBackground: '#ffffff',
            checkedHoverBackground: '#ffffff',
          },
        },
      },
    },

    datatable: {
      headerCell: {
        background: gray[100], // gray-500 text on it is 4.5:1, so it can't get darker without darker text
        borderColor: gray[200], // ends the band, also above a gray-100 group row (financial report)
        color: gray[500],
        padding: '0.75rem 1.5rem', // 24px sides line table text up with the card header
      },
      columnTitle: { fontWeight: '500' },
      bodyCell: {
        borderColor: gray[100],
        padding: '1rem 1.5rem',
      },
    },
  },
});

function toastSeverity(background: string, color: string) {
  return {
    background,
    borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
    color,
    detailColor: gray[700],
    closeButton: { hoverBackground: `color-mix(in srgb, ${color} 12%, transparent)`, focusRing: { color } },
  };
}
