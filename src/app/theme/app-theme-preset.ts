// App theme v2 — PrimeNG 19 preset ("TailAdmin" style). Rules: DESIGN_GUIDELINES.md
//
// Blue #465fff accent, TailAdmin greys, soft radii (8px controls, 16px cards), pill status tags.
// Every PrimeNG component reads these tokens. Change the look HERE, never with ::ng-deep.
// If TypeScript flags a component token name, check that component's "Theming" tab in the PrimeNG docs.

import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

// TailAdmin palettes (copied from its source, src/styles.css)
const brand = {
  50: '#ecf3ff', 100: '#dde9ff', 200: '#c2d6ff', 300: '#9cb9ff', 400: '#7592ff',
  500: '#465fff', 600: '#3641f5', 700: '#2a31d8', 800: '#252dae', 900: '#262e89', 950: '#161950',
};
const gray = {
  0: '#ffffff', 50: '#f9fafb', 100: '#f2f4f7', 200: '#e4e7ec', 300: '#d0d5dd', 400: '#98a2b3',
  500: '#667085', 600: '#475467', 700: '#344054', 800: '#1d2939', 900: '#101828', 950: '#0c111d',
};

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

    // TailAdmin focus: soft 4px blue halo
    focusRing: {
      width: '4px',
      style: 'solid',
      color: 'rgba(70, 95, 255, 0.12)',
      offset: '0',
      shadow: 'none',
    },

    // 44px controls with 16px text (line height fixed at 24px in styles.css)
    formField: {
      paddingX: '0.875rem',
      paddingY: '0.5625rem', // 24px line + 2 x 9px + 2px border = 44px
      borderRadius: '{border.radius.md}',
    },

    colorScheme: {
      light: {
        surface: gray,
        primary: {
          color: brand[500],
          contrastColor: '#ffffff',
          hoverColor: brand[600],
          activeColor: brand[700],
        },
        highlight: {
          background: brand[50],
          focusBackground: brand[100],
          color: brand[600],
          focusColor: brand[700],
        },
        text: {
          color: gray[800],
          hoverColor: gray[900],
          mutedColor: gray[500],
          hoverMutedColor: gray[600],
        },
        content: {
          background: '#ffffff',
          hoverBackground: gray[50],
          borderColor: gray[200],
          color: gray[800],
          hoverColor: gray[900],
        },
        formField: {
          background: '#ffffff',
          borderColor: gray[300],
          hoverBorderColor: gray[400],
          focusBorderColor: brand[300],
          invalidBorderColor: '#fda29b',
          disabledBackground: gray[50],
          disabledColor: gray[500],
          placeholderColor: gray[400],
          color: gray[800],
          shadow: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
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
        paddingY: '0.5625rem', // 24px line + 2 x 9px + 2px border = 44px = --spacing-control in styles.css
        borderRadius: '{border.radius.md}',
        iconOnlyWidth: 'var(--spacing-control)', // icon-only buttons are square
        // All buttons share one height: size="small" renders like the default size
        sm: {
          fontSize: '1rem',
          paddingX: '1rem',
          paddingY: '0.5625rem',
          iconOnlyWidth: 'var(--spacing-control)',
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
        borderRadius: '999px',
      },
      // Text one shade darker than TailAdmin's so it passes 4.5:1 contrast
      colorScheme: {
        light: {
          primary: { background: brand[50], color: brand[600] },
          info: { background: brand[50], color: brand[600] },
          secondary: { background: gray[100], color: gray[700] },
          success: { background: '#ecfdf3', color: '#027a48' },
          warn: { background: '#fffaeb', color: '#b54708' },
          danger: { background: '#fef3f2', color: '#b42318' },
          contrast: { background: gray[800], color: '#ffffff' },
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

    datatable: {
      headerCell: {
        background: gray[50],
        borderColor: gray[100],
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
