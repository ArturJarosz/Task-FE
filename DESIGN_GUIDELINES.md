# App design guidelines (v2)

Rules every screen in this app follows. When building or changing UI, by hand or with Claude Code, read this file first. If a screen needs something not covered here, add the rule here first, then build it.

Stack: Angular 19, PrimeNG 19 (styled mode, `AppThemePreset` in `src/app/theme/app-theme-preset.ts`, based on Aura), Tailwind 4 with `tailwindcss-primeui`. The look follows the TailAdmin dashboard: Outfit font, a brand colour (default muted blue `#415cc8`, configurable), white 16px-rounded cards on a light grey page, and a dark theme (section 2, "Theming").

## 1. Principles

1. **Soft cards on grey.** A page is white cards (1px `gray-200` border, 16px radius, no shadow) on `gray-50`. Never nest cards in cards, accordions in cards, or tabs inside accordions.
2. **Brand colour means action or selection.** `brand-500` is for primary buttons, the active nav item, the active tab, links, and focus. Status uses its own colors (section 5). Everything else is grey.
3. **Say what a button does.** Buttons have text labels ("New project", "Add stage", "Save changes"). Icon-only buttons are allowed only for row actions (`⋯`), close buttons, top bar icons, field help (see "Field help") and the dashboard's "Customize dashboard" button, always with `aria-label` and a tooltip.
4. **Read first, edit on purpose.** Detail pages show values as text. Each section card has a rounded "Edit" button that opens a dialog with the form.
5. **Tokens, not overrides.** Colors, radius, and spacing come from `app-theme-preset.ts` and the `@theme` block in `styles.css`. No `::ng-deep`, no hex values in components, no inline color styles. Use Tailwind classes such as `text-gray-500` and `bg-brand-50`, which match the tokens.

## 2. Tokens

### Color
Values are the light-theme defaults; the dark theme and the brand colour setting change them at runtime (see "Theming").

| Role | Value | Tailwind | Use |
|---|---|---|---|
| Brand / primary | `#415cc8` | `brand-500` | Primary buttons, active nav, active tab, links |
| Brand hover | `#374eaa` | `brand-600` | Hover on primary; text on `brand-50` |
| Brand tint | `#eceff9` | `brand-50` | Active nav background, info tags, selected rows |
| Page | `#f9fafb` | `gray-50` | Page background, table header band |
| Surface | `#ffffff` | `white` | Cards, sidebar, top bar, dialogs |
| Subtle fill | `#f2f4f7` | `gray-100` | Segmented control track, icon tiles, row dividers |
| Border | `#e4e7ec` | `gray-200` | Card, sidebar, and top bar borders |
| Input border | `#d0d5dd` | `gray-300` | Inputs and outline buttons |
| Text | `#1d2939` | `gray-800` | Values, names, headings |
| Label text | `#344054` | `gray-700` | Form labels, outline button text, nav items |
| Secondary text | `#667085` | `gray-500` | Table headers, field labels, subtitles, meta |
| Muted | `#98a2b3` | `gray-400` | Placeholders and "Not set" only (fails 4.5:1, never for real information) |

### Typography (Outfit; body 16px)
Tailwind's `text-xs` / `text-sm` / `text-base` are redefined in `styles.css` as 14 / 16 / 18px, so use those classes rather than pixel sizes. Icons keep their own sizes (`text-xl` on `<i>`).
| Style | Size / weight | Use |
|---|---|---|
| Page title | 22px / 600 | `.app-page-title`, one per page |
| Dialog title | 26px / 600 | Dialog headers |
| Card title | 20px / 600 | `.app-card-title` |
| KPI number | 24px / 700 (32px for a standalone figure such as the payments gauge) | `.app-kpi-value` (`.app-gauge-value`) |
| Body | 16px / 400 | Everything else |
| Value | 16px / 500 | `.app-field-value`, names in tables |
| Form label | 16px / 500, `gray-700` | `.app-form-label` |
| Table header | 15px / 500, `gray-500` | `<th>` (set globally in `styles.css`) |
| Field label | 14px / 400, `gray-500` | `.app-field-label` |

Money and counts use `.app-num` (tabular, right-aligned) and the PLN pipe: `{{ v | currency:'PLN':'symbol':'1.2-2' }}` renders "50 000,00 zł".

### Shape and spacing
- Radius: 8px controls, 12px icon tiles and menus, 16px cards, 24px dialogs, full for tags and avatars.
- Controls are 44px tall: inputs, selects, buttons, the segmented control frame (40px items plus 2px padding) and the calendar toolbar, so controls in one row always line up. The height is one token, `--spacing-control` in `styles.css` (`h-control`, and `h-control-inner` for items inside a segmented frame); the preset's padding adds up to it. Icon-only buttons are 44×44. `size="small"` renders like the default size, so don't use it.
- Gaps: 24px between cards and grid columns (`gap-6`), 24px card padding (`p-6`), 20px vertical card header padding (`py-5`).
- Shadows: only `shadow-theme-xs` on inputs, outline buttons, and the active segment, plus a soft overlay shadow on dialogs and menus.
- Focus: 4px soft brand halo (`shadow-focus-ring`), set in the preset.

### Theming (brand colour and dark mode)
Every colour is a CSS variable, and PrimeNG and Tailwind read the same ones, so components never need to know the theme.
- **Brand colour:** the "Theme color" system parameter (`#rrggbb`, one value for everyone), edited under Settings › Appearance. `ThemeService` turns it into the `--app-brand-50…950` scale plus `--app-brand-contrast` (white or `gray-900`, whichever reads better on `brand-500`) and writes them on `<html>`. The PrimeNG `primary` palette and Tailwind's `brand-*` both point at these variables. The default `#415cc8` (`DEFAULT_BRAND_COLOR`; the backend seeds the parameter with the same value) keeps the shades written in `styles.css`: PrimeNG's `palette()` output for it, except a stronger 10% tint for 50, because the generated one is almost white. Changing the default means changing the backend default, `DEFAULT_BRAND_COLOR` and those shades together.
- **Dark mode:** `<html class="app-dark">`, a per-user choice (Settings › Appearance), saved per user as the `THEME_MODE` user configuration (`USER_CONFIGURATION` table; `GET /users/current/configurations`, `PUT /users/current/configurations/THEME_MODE` with `LIGHT` or `DARK`). `localStorage` keeps a copy so the next start paints the right mode before the user loads; a user without an account record keeps the choice in the browser only. The `.app-dark` block in `styles.css` gives the same variables dark values: the grey scale runs the other way (`gray-50` is the darkest background, `gray-800` the light main text), `white` becomes the dark card surface, and `brand-50/100`, `success-50`, `warning-50` and `error-50` become dim tints, with their text shades lighter. PrimeNG's own dark scheme is off (`darkModeSelector: 'none'`); its light scheme follows the variables.
- **Rules:**
  - Use the token classes as usual (`bg-white`, `text-gray-800`, `bg-brand-50 text-brand-600`). They adapt by themselves, so don't add `dark:` variants.
  - `white` means "surface", not the colour white. For text on a brand fill use `var(--app-brand-contrast)`, and for a fill that must not change in dark mode use `--app-brand-500`.
  - For backdrops use `bg-black/40`, not a grey (greys flip).
  - Charts read colours with `cssColor()` when they build their data, so they pick up the theme of the moment they render.
  - No new hex values in the preset or components: add a variable in `styles.css` with a light and a dark value.

## 3. App shell

- **Sidebar** (`--app-sidebar-w`, 290px): white, right border `gray-200`. The logo sits at the top. Groups are labelled in uppercase 12px `gray-500`: *Work* (Dashboard, Projects, Calendar), *People* (Architects, Clients, Contractors, Suppliers), *Finance* (Financial report), *Admin* (Settings).
  - Items: `.app-nav-item`, 14px medium `gray-700`, 8px radius, hover `gray-100`.
  - Active item: `.app-nav-item.active`, with `brand-50` background and `brand-500` text and icon.
  - Icons are PrimeIcons only (remove `font-awesome`):

    | Item | Icon |
    |---|---|
    | Dashboard | `pi-th-large` |
    | Projects | `pi-folder` |
    | Calendar | `pi-calendar` |
    | Architects | `pi-id-card` |
    | Clients | `pi-users` |
    | Contractors | `pi-wrench` |
    | Suppliers | `pi-truck` |
    | Financial report | `pi-chart-bar` |
    | Settings | `pi-cog` |
- **Top bar** (76px): white with a bottom border. It holds a search field (44px, "Search or type command...", ⌘K hint) on the left, and on the right a round 44px notifications button plus the user avatar, name, and chevron.
  - **User menu:** a `p-menu` popup, 256px wide and right-aligned under the avatar. Its `start` template shows the avatar, name and email over a `gray-200` divider; the items below are actions only (today just "Log out" with `pi-sign-out`). The chevron turns 180° while the menu is open. Never show information as a disabled menu item.
- **Menus** (user menu, row `⋯` menus): 12px radius, 8px list padding, 14px `gray-700` items with `gray-500` icons and a `gray-100` hover. These come from the `menu` tokens in the preset.
- **Content:** 24px padding, max width 1536px.

## 4. Page templates

### Every page
`.app-page-header`: page title on the left, breadcrumb on the right (Home › Projects › Lublin 01).
Use `<app-page-header title="Project" [crumbs]="crumbs"/>` (`src/app/shared/page-header`) and set `data: {ownPageHeader: true}` on the page's route so the app shell hides its old breadcrumb bar. Page-wide actions (only the dashboard has any today) go inside it as content and sit right of the breadcrumb. Read-only fields use `<app-field label="…" [value]="…"/>` (`src/app/shared/field`), which shows "Not set" (or `emptyText`) when empty.

### Card rows (every page)
A row of cards is either one full-width card, or cards whose widths are 25%, 50% or 75%. Never `auto-fit`, never fixed sidebar widths such as 340px, and never three equal cards. Below `xl` (1280px) every card is full width and the rows stack. From `xl` the row is a 4-column grid:
- Four KPI cards: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6`. Each card is 50% from `md` and 25% from `xl`.
- Two cards at 50%: `grid grid-cols-1 md:grid-cols-2 gap-6`.
- Main and side column at 75% / 25%: `grid grid-cols-1 xl:grid-cols-[calc(75%_-_6px)_minmax(0,1fr)] gap-6`. The `-6px` lines the side column up with the fourth card of the KPI row above (the gap is 24px).
- Three cards: `grid grid-cols-1 xl:grid-cols-4 gap-6`, with the widest card `xl:col-span-2` (25 / 25 / 50).

### Dashboard
Each user arranges their own dashboard out of widgets, in rows of **stacks**. A stack is a column of up to three widgets on top of each other; it is 25%, 50%, 75% or 100% wide, never narrower than the minimum of any widget in it, and the stacks of a row add up to at most 100%. A row is as tall as its tallest stack, and the widgets of a stack split its height equally (minus the 24px gap); when their content needs more, the row grows instead, so a chart at 50% next to a stack of Year summary and Upcoming events gives each of those half the chart's height. Every card stretches to the height it gets. The layout is saved per user as the `DASHBOARD_LAYOUT` user configuration (`PUT /users/current/configurations/DASHBOARD_LAYOUT`, a versioned JSON document the frontend owns, at most 4000 characters; version 2 has stacks, version 1 layouts are read as one stack per widget). Until a user saves one they see the default layout, one widget per stack:
1. A row of four KPI cards (see Card rows). Each is an `<app-kpi-card icon="pi pi-…" label="…" [loading] [loadFailed]>` (`src/app/shared/kpi-card`), the same card the list pages use: a 48px grey icon tile on the left, then the label above a 24px number (the projected content), plus an optional context pill next to the number. It shows the skeleton and "Couldn't load" itself.
2. A chart card (title, subtitle, segmented Monthly / Quarterly / Annually) at 75% next to a summary card at 25%.
3. A list card ("Upcoming events") next to a table card ("Active projects"), 50% each. Each shows at most 5 rows and has a "See all" outline button that opens the full page.

Widgets (`DASHBOARD_WIDGETS` in `src/app/dashboard/layout/dashboard-layout.ts`; each can be placed once): Active projects count, Income / Expenses / Balance this year (KPI cards), Income and expenses chart (at least 50%; Annually covers the last 5 years), Year summary, Upcoming events, Active projects table (at least 50%). A new widget gets a definition there, a case in the dashboard's widget template, and a minimum width if it is a chart or table.

Rows follow Card rows, with stacks in place of cards: from `xl` a row is a 4-column grid and a stack spans its width. Between `md` and `xl` a row is 2 columns: in a row of only 25% and 50% stacks each takes one column (a last odd one spans both), in any other row every stack is full width. Below `md` every stack is full width. The widgets of a stack always stay on top of each other.

**Edit mode.** A round outline icon button (`pi-sliders-h`, "Customize dashboard") right of the breadcrumb switches to edit mode; there the header shows a text "Reset to default", an outline "Cancel" and the primary "Save layout" instead. Saving leaves edit mode with a "Dashboard saved" toast; a failed save keeps edit mode and the draft. Leaving the page drops unsaved changes. In edit mode:
- A grey hint line says how to move stacks and widgets.
- Each row is a dashed `gray-300` 16px-rounded area (not a card) with "Row N", "N% free" and a `⋯` menu (Move row up, Move row down, Remove row).
- Each stack is a `gray-100` 16px-rounded panel. Its top bar is a `pi-arrows-alt` grip, a segmented width control (on a `gray-200` track; widths that don't fit are disabled) and a `⋯` menu (Move left, Move right, Move to row above, Move to row below, Remove stack, or Remove widget for a stack of one). Dragging the bar moves the stack within its row or into any row with room for it, where it narrows to the free space.
- Each widget in a stack has a bar above it: a grip, the widget name and a `⋯` menu (Move up and Move down within a stack of several, Move into stack on the left / right, Move out of stack, Remove widget). Dragging the bar moves the widget within its stack or into another stack with fewer than three widgets that is wide enough for it; a stack it leaves empty disappears. "Move out of stack" puts it in a new stack right after, taking the row's free space first and then narrowing the stack it leaves. The widget itself shows as in view mode but `inert`.
- The free part of a row (at least 25%) is a dashed `.app-add-tile` area. Dropping a widget there gives it a stack of its own. While some widget not on the dashboard fits there, it is an "Add widget" button that opens a dialog listing those widgets (icon tile, name, one line, the width it will get, or "Needs N% free" disabled); picking one adds it as a new stack. Otherwise it says "Drop a widget here to give it its own stack".
- A full-width dashed "Add row" tile ends the page.
- An empty saved dashboard shows one card with an empty state and an outline "Customize dashboard" button.

The dashboard keeps its own `DashboardStore`, so it never changes the financial report page's filters; it also holds the layout being edited.

### List page (Projects, Clients…)
1. Optional row of `<app-kpi-card>`s.
2. One card holding the table. Its header has the title and subtitle on the left; on the right sit a status segmented filter, a "Filter" outline button, and the primary "New project" button.
3. The table header band is `gray-50`. Rows have a checkbox and a two-line name (name in 500 `gray-800`, type in 12px `gray-500`). People appear as initials avatars plus name and role, followed by status pills, money right-aligned, and a `⋯` row menu.
4. The footer has "Showing 1–10 of N" plus Previous and Next buttons (`p-paginator` styled to match).

### Detail page (Project, Client…)
1. A header card with a 72px brand-tinted icon tile, the name (20px/600), a status pill, and a meta line with dividers (type | client | architect). Export and `⋯` sit on the right.
2. Routed sub-pages as a segmented control (`.app-seg`): Overview, Stages, Timeline, Finance, Documents.
3. Two columns: the main column holds section cards (Contract, Project details); sub-page content such as the stages list lives only on its own tab, never repeated on Overview; the side column (about 340px) holds the payments summary and People.
4. Section cards have the title on the left and a rounded "Edit" outline button with a pencil on the right. Fields sit in a 3-column grid with label above value. Empty values show "Not set" in `gray-400`.

### Project timeline tab (`/projects/:id/timeline`)
Built only from dates the app already has: the contract (start, end, deadline), the project's start and end, stage start and end (or deadline), and installment payment dates. Every row takes its dates from its own entity only: the contract row from the contract, the "Project" row and the Project cards from the project's `startDate` / `endDate`, each stage from the stage. Nothing is derived from another entity: no project dates from the stages or the contract, and "Days to deadline" counts only to the contract deadline, never to its end date. Never show dates the backend doesn't store, and no milestones or key-date lists: every date sits on the bar it belongs to. The contract and the work are separate: the contract never stands in for project dates, or the other way round.
1. A row of four KPI cards: Project start, Project end, Project duration (days, with a months pill) and Contract deadline (with a relative pill, `warn`, or `danger` once passed).
2. A full-width chart card ("Project timeline", no subtitle and no scale switch: the chart is always by month). A 240px label column sits next to a track that spans whole months around every date. The month row is 32px: each month is one label, month and short year ("May'25", 14px, 500), at the bottom. Rows come in two groups with no group headings (the row names already say what they are); a `gray-200` line under the contract row separates them:
   - **Contract**: one `gray-200` bar from the contract start to its end, labelled with its day count only, with its deadline shown on the bar (below); the label column shows only the name.
   - **Project**: a row named just "Project" (every row is a duration, so none says so) as a `--app-brand-500` bar with `--app-brand-contrast` text and its day count, then one compact 44px row per stage with only the stage name (a link) in the label column; the dates are on the bar and in its tooltip. A stage bar ends only at the stage's own end date, never at its deadline; a started stage that isn't done or rejected and has no end date is open. The stage deadline is shown on its bar, like the contract deadline (below). A Done stage always has an end date (the backend sets it when the stage completes), so one without is a data error. So is an end date before the start date, on any row (contract, project or stage): it is never dropped or drawn as an open bar. A row with a data error has no bar, an `error-600` `pi-exclamation-triangle` at its start (tooltip "Done, but the stage has no end date" or "The end date is before the start date") and the legend gets a "Date error" entry while any row has one; for the project, Project end shows its date with a `danger` "Before start" pill and Progress says why it can't be shown. A stage with a start but nothing to draw yet (not started, or rejected without an end) says so on its row in `gray-400`: "Starts dd.mm.yyyy", or "From dd.mm.yyyy, no end date". Stage bars are 24px with no text: `brand-200` whether done or not (the status is in the tooltip), rejected `gray-200`; the lightest tint (`brand-100`) is too faint against the white card. All timeline tooltips use 14px text (`tooltipStyleClass="text-xs"`), like the labels around the chart. Every bar (contract, project, stage) has the same tooltip, a PrimeNG `pTooltip` with an `ng-template`: the item's name ("Contract", "Project" or the stage name) in 500 weight, then its dates ("dd.mm.yyyy – dd.mm.yyyy", always shown, with "no end date" when the end is missing), then its duration ("168 days", "14 days so far"), then "Deadline dd.mm.yyyy" when it has a deadline (there is no deadline marker to hover). Each installment's payment date is an 18px circle on its stage's row, drawn as inline SVG (one `ng-template` for every row): paid is a `success-700` circle with a white tick, not paid and still due (payment date today or later) an empty white circle with a `gray-500` ring, and overdue (not paid, payment date passed) an `error-600` circle with a white clock. Green says done, red says late, grey says nothing is wrong yet. The tooltip has the date, amount and Paid / Not paid / Overdue. Markers have no white edge. An installment whose stage isn't on the project goes on the "Project" row.

   The contract and project rows are 44px like the stages, and never print dates and have no start or end markers: the bar shows its day count, and its tooltip has the dates.

   **Deadlines** have no marker of their own; they show on the bar (contract and stages; a project has no deadline). The stretch of a bar past its deadline, from the day after the deadline to the bar's end (today for an open bar), is striped soft red and white at 45° (`.app-past-deadline` in `styles.css`: `error-600` mixed 60% with white, 4px stripes), over the bar, with the bar's rounded right end; a bar that started after its deadline is striped whole. A bar that ends on its deadline is not late.

   A bar with a start but no end is open: it runs to today and says "N days so far"; one whose start is still ahead is one day long at its start and says "Starts in N days", and its dashed stretch to the deadline begins the day after it. That applies to the contract, the work and a started stage that isn't done. If its deadline is still ahead, a dashed outline (2px, the bar's tint: `gray-300` for the contract, `brand-300` for stages) carries on from tomorrow to the deadline, and the bar's right end is square to join it. With no deadline, or one already passed, nothing follows the bar and its end is rounded. For an open project, Project end shows "Not set" with an "Ongoing" pill and Progress shows "Day N" instead of a percentage. The chart range reaches two weeks past today whenever a bar is open, so the "Today" label stays visible. A 2px `today` (sky `#007bb8`, the same in both themes) "Today" line crosses the rows, under the bars and markers (only the grid lines sit below it). Its label sits in a 36px lane at the bottom of the grey header, under the month row (centred, 6px above and below), never on a row: today's date as "dd.mm", shaped like the bars (24px tall, `rounded-md`, 500 weight), sky with white `today-ink` text (4.6:1); hovering the label shows "Today". The range starts a few days before the first date and ends a few days after the last, so a marker on either end is never cut in half. The chart gets a minimum width (96px per month) and scrolls sideways in its card. The label column stays pinned while the chart scrolls (sticky, `isolate` on the scroll box so the chart's layers never cover the top bar). A label inside a bar shifts right past any marker that would cover it. A bar too short for its label (also after that shift) shows the label next to it, on a stretch of the row free of markers: right after the bar (past an open bar's dashed stretch to its deadline), else before it, else just past a marker after the bar; it sits on a white background above the Today line. When nothing fits, the label stays in the bar, truncated, and the bar's tooltip has it in full. A legend sits under the chart, listing only what isn't self-explanatory: Past deadline, the three installment states, and "Date error" when it occurs. If the installments fail to load, a line above the legend says "Installment payment dates couldn't be loaded." with a "Try again" outline button, and Installments paid in Progress shows "Couldn't load" in `gray-400` (never "0 of 0"). The chart redraws at midnight, so the Today line and overdue payments stay right in a tab left open. Dates from the backend are read as local days (`parseISO`), never as UTC midnight. Bars (contract, project, stages) and the Today line need no entry. The chart's empty state ("No dates yet") appears only when the project has no dates at all.
3. A full-width "Progress" card: from `xl`, on the left the time passed between the project start and end (percentage and bar, or "Day N" while open); on the right Stages done, Installments paid and Days to deadline (the contract deadline, or "N days late" in `error-700`).

### Edit dialog
`p-dialog` with 24px radius, about 700px wide, 32px padding. It has a title, a one-line description, and a round grey close button. The form is a 2-column grid with labels above 44px inputs, plus a "Cancel" outline button and a "Save changes" primary button on the bottom right.

### Settings page (`/settings/:section`)
A 25% section nav card next to a 75% content column (`grid grid-cols-1 xl:grid-cols-[calc(25%_-_18px)_minmax(0,1fr)] gap-6 items-start`). The nav groups sections under `.app-nav-group` labels and links them with `.app-nav-item` (active: `routerLinkActive="active"`); below `xl` the items wrap in a row above the content. Each section is its own route, listed in `settings-sections.ts`; `/settings` opens the first one and the breadcrumb ends with the section name (Home › Settings › System parameters).

Settings cards are compact, unlike other pages: the card header is `px-5 py-4` with a 18px/600 title (`text-base font-semibold`) over a 14px `gray-500` subtitle, and the body is a list of short rows (`px-5 py-2.5`, `border-b border-gray-100`) under a `gray-200` top line. Each row has the setting's name (500 `gray-800`) and a 14px hint on the left, and its value or control on the right. Row edit and reset buttons are icon-only text buttons with `aria-label` and a tooltip.

Sections today:
- **System parameters**: a compact table (`gray-50` header band with Name, Value, Default; one row per parameter, values tabular) with a pencil button per row. It opens the standard edit dialog with one field whose input matches the parameter type (`TEXT` text input, `NUMBER` and `DECIMAL_NUMBER` `p-inputnumber` in Polish format, `BOOLEAN` `p-toggleswitch` with "On" / "Off" in the table, `SECRET` an empty password input with the hint "The saved value is never shown. Enter a new one to replace it" and "Set" / "Not set" in the table, because the API returns only `valueSet`), the default value as a hint, a text "Reset to default" button on the left and "Cancel" / "Save changes" on the right. The "Theme color" parameter is left out here; Appearance edits it.
- **Appearance**: compact rows. "Dark theme" has a hint ("Saved to your account…") and a `p-toggleswitch` on the right; it applies at once. "Brand color" has a `p-colorpicker`, a 112px monospace `#RRGGBB` field and a reset icon button on the right, with the default value in the hint. A colour whose contrast with white is below 3:1 gets a warning hint instead, because `brand-500` is used for links. A "Preview" row shows an outlined button, a tag, an active nav item and link text. While editing, the whole app previews the colour; "Cancel" and the primary "Save changes" sit at the bottom right, and leaving the section drops an unsaved preview.
- **Google Calendar** (group *Integrations*): compact rows over six system parameters (`Google calendar sync` `BOOLEAN`, `Google calendar credentials` `SECRET`, `Google calendar name`, `Google calendar application name`, `Google calendar poll interval` and `Google calendar push retry interval` `NUMBER`), which the System parameters list leaves out. The first row is "Connection": a status `p-tag` and an outline "Check connection" button (`GET /calendars/connection-status`, run on every visit and after each save), with a hint that says what to do and, for failures, Google's own message in 14px monospace `gray-500`. The check uses the saved settings, so the button is disabled while the form has unsaved changes, with a tooltip saying so (on a wrapping `span`, because a disabled button gets no pointer events). While a check runs, the button's spinner replaces the tag. Then "Sync with Google Calendar" (`p-toggleswitch`), "Service account key", "Calendar name" and "Application name" (256px inputs), then "Fetch changes from Google every" and "Retry unsent events every" (256px numeric inputs with a "min" suffix, whole minutes from 1 to 1440, saved without leading zeros; the sync hint quotes the saved poll interval). The key is a `SECRET` parameter: the API returns only `valueSet`, never the value, so the row shows "Saved for {service account email}" (the email comes from the connection check) and a "Replace key" outline button; the 6-row monospace textarea (with a text "Load from file" button) appears only when no key is saved or after "Replace key", and "Cancel" closes it again. A question-mark help button next to the "Service account key" label opens a step-by-step guide to creating the key in Google Cloud (see "Field help"). A pasted key is checked in the browser (a JSON key with `type: service_account`), and a key for a different service account gets a warning hint, because saving it moves sync to a new calendar. "Save changes" sends only the changed parameters through `PUT /system-parameters/{id}`, key first and sync last. If a save stops at an error, the fields that were stored show the stored value and the rest keep what was typed; "Cancel" and the primary "Save changes" sit at the bottom right. While the connection is "Connected", a "People with access" block follows in the same card (`GET/POST/DELETE /calendars/shares`): one row per person with the email, a role `p-tag` ("Can view", "Can edit", "Free/busy only", "Owner") and a small text secondary "Revoke" button that opens the page's confirm dialog (a `danger` "Revoke" accept, because it removes access). Roles the application cannot give (owner, free/busy) show "Managed in Google" instead of "Revoke". Below the list sit an email input, a "Can view"/"Can edit" `p-select` and an outline "Share" button (outline, because "Save changes" is the card's primary); an email that already has access gets an inline error. Skeletons show only before the first load; later connection checks refresh the list in place.

### Signed-out pages (`/not-logged-in`, `/logout`)
Render inside the app shell with `data: {ownPageHeader: true}` on the route and no page header or breadcrumb. The top bar shows only the sidebar toggle, because search, notifications and the user menu need a signed-in user. One centered card (`max-w-lg`, `mt-12`, `p-8` at every width, text centered) with a 56px grey icon tile, the page title, one line of explanation, and a live countdown to the redirect, "Redirecting to the login page in 3 s…" (`aria-live="polite"`). The only button is primary and starts login at once; the redirect still happens after the countdown. Copy says "log in" and "logged out", never "sign in" or "signed out".

| Variant | When | Icon | Title | Line | Button |
|---|---|---|---|---|---|
| Not logged in | `/not-logged-in` | `pi-lock` | You are not logged in | Log in to see projects, clients and finances. | Log in now |
| Session expired | `/not-logged-in?reason=expired`, set by `AuthorizationService` when the stored session can't be renewed | `pi-lock` | Your session has expired | For your security you were logged out. Log in again to keep working. | Log in now |
| Logged out | `/logout` | `pi-sign-out` | You have been logged out | Log in again to get back to your projects. | Log in again |

## 5. Components

### Buttons
| Type | PrimeNG | Use |
|---|---|---|
| Primary | `<p-button label="New project" icon="pi pi-plus" />` | The main action. At most one per card or dialog. |
| Outline | `severity="secondary" [outlined]="true"` | Filter, Export, Cancel, See all |
| Edit | outline + `[rounded]="true"` + `icon="pi pi-pencil"` | Section card "Edit" |
| Danger | `severity="danger"` | Only inside delete confirmations |
| Row action | `icon="pi pi-ellipsis-h" [text]="true" [rounded]="true" severity="secondary"` + `pTooltip` | Table rows |
| Field help | `icon="pi pi-question-circle" [text]="true" [rounded]="true" severity="secondary"` + `ariaLabel` | Next to a field label whose value has to be fetched elsewhere |

### Field help
When filling a field needs steps outside the app (such as the Google Calendar service account key), put a help button right after its label. Its `pTooltip` is an `ng-template` with a short numbered guide: `tooltipEvent="both"` so keyboard focus opens it too, `[autoHide]="false"` so it stays open while the pointer is on it and its links can be clicked, `tooltipPosition="bottom"` and `tooltipStyleClass="max-w-md"`. Inside, use 14px text, a bold one-line title, at most six steps naming the exact menu path ("IAM & Admin › Service accounts"), underlined links that open in a new tab, and no colour classes (the tooltip has its own dark surface). Keep the hint under the field for the one-line explanation; the guide is for the how-to.

### Status tags (`p-tag`)
Pills, always through `statusSeverity()` in `src/app/shared/status-severity.ts`:

| Status (backend enum value) | Severity | Look |
|---|---|---|
| Offer (`OFFER`) | `secondary` | grey |
| To do (`TO_DO`), Accepted (`ACCEPTED`), Signed (`SIGNED`) | `info` | blue |
| In progress (`IN_PROGRESS`), Pending / Delete pending sync (`PENDING`, `DELETE_PENDING`) | `warn` | orange |
| Done (`DONE`), Completed (`COMPLETED`), Synced (`SYNCED`) | `success` | green |
| Rejected (`REJECTED`), Terminated (`TERMINATED`) | `danger` | red |
| Google Calendar connection: Off / Not configured (`DISABLED`, `NOT_CONFIGURED`) | `secondary` | grey |
| Google Calendar connection: Connected (`CONNECTED`) | `success` | green |
| Google Calendar connection: Invalid key, No access, Calendar missing, Unreachable (`INVALID_CREDENTIALS`, `PERMISSION_DENIED`, `CALENDAR_NOT_FOUND`, `CONNECTION_FAILED`) | `danger` | red |
| Google Calendar share role: Can view (`READER`) | `info` | blue |
| Google Calendar share role: Can edit (`WRITER`) | `success` | green |
| Google Calendar share role: Free/busy only (`FREE_BUSY_READER`) | `secondary` | grey |
| Google Calendar share role: Owner (`OWNER`) | `warn` | orange |

The keys come from the generated enums (`ProjectStatus`, `StageStatus`, `TaskStatus`, `ContractStatus`, `CalendarEventSyncStatus`, `GoogleCalendarConnectionStatus`, `CalendarShareRole`). A new enum value fails to compile until it gets a severity in `status-severity.ts`. Labels come from the configuration entries via `resolveLabel()`. `contrast` (dark) is reserved for statuses that don't exist yet, such as "On hold".

When an entity has two statuses, label them explicitly: "Contract status" and "Project status".

### Forms
- `.app-form-label` above the input, in sentence case with no colon. Required fields get a red `*`.
- Inputs fill their cell (`class="w-full"` / `styleClass="w-full"`). Money uses `p-inputnumber` with a "zł" suffix. Dates use `p-datepicker dateFormat="dd.mm.yy" [showIcon]="true" appendTo="body"`. Always set `appendTo="body"` on date pickers and selects: otherwise the popup is clipped by the card or accordion it sits in.
- Errors show a light-red border plus a 12px red message under the field that says what to fix ("End date must be after the start date").
- Hints show as a 12px `gray-500` line under the field.
- Yes/no fields use `<p-toggleswitch inputId="…">` with its label to the right on the same row (14px medium `gray-700`). A toggle that reveals more fields ("Add an installment") gets a one-line hint under its label. On detail pages, show them read-only as "Yes" / "No" with `<app-field>`. In dialogs, put toggles together in one grid row, one toggle per column cell (`flex items-center gap-3`), so each lines up with the column below it. Place a toggle directly above the field it controls ("Paid" above "Payment date"). Never mix toggles and inputs in the same row, and never squeeze toggles into one cell.
- Person pickers (architect, client) are `p-select` with `[filter]="true"`, options labelled with the full name, and a hint when they default to a value ("Defaults to the project's architect").

### Empty states
Inside the card: a 56px grey circle with an icon, a 16px/600 title ("No stages yet"), one line of explanation, and, when not already in the card header, the create button.

### Feedback
- A toast after save or delete: "Contract saved".
- `p-confirmdialog` for destructive actions: "Delete Lublin 01? This can't be undone." Each page renders one `<p-confirmDialog [style]="{width: '480px'}" [breakpoints]="{'640px': '95vw'}"/>` in its shell; components nested in it (lists, cards) never add their own, or the dialog opens twice. Accept buttons say what happens ("Delete", "Reject stage", "Reopen stage") next to an outline "Cancel"; only deletes use `severity: 'danger'`.
- `p-skeleton` while loading, shaped like the content.
- When a load fails, replace the skeletons with an error state: `<app-load-error>` for a whole page ("Couldn't load this stage", an outline "Back to stages" and "Try again"), or `<app-empty-state>` with a warning icon and an outline "Try again" inside a single card. KPI values show "Couldn't load" in `gray-500`. The REST error toast still appears as well.

## 6. Copy
- Sentence case: "Financial components", "Edit contract".
- Use "Net", never "Nett". Money is PLN, Polish format. Dates are `dd.mm.yyyy`.
- Name sections from the page's point of view: "Projects" on an architect page, not "Client projects".

## 7. Checklist before merging UI
- [ ] Cards: white, `gray-200` border, 16px radius, no shadow, never nested
- [ ] One primary (brand colour) button per card or dialog
- [ ] Statuses are `p-tag` pills through `statusSeverity()`
- [ ] Money is right-aligned, tabular, and in PLN format
- [ ] Every table has an empty state
- [ ] No hex colors, `::ng-deep`, `dark:` variants, or inline colors in components
- [ ] Checked in the dark theme and with a non-default brand colour (Settings › Appearance)
- [ ] Icon-only buttons have `aria-label` and a tooltip
