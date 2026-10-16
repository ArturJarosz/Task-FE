# OMCD design guidelines (v2)

Rules every screen in this app follows. When building or changing UI, by hand or with Claude Code, read this file first. If a screen needs something not covered here, add the rule here first, then build it.

Stack: Angular 19, PrimeNG 19 (styled mode, `OmcdPreset` in `src/app/theme/omcd-preset.ts`, based on Aura), Tailwind 4 with `tailwindcss-primeui`. The look follows the TailAdmin dashboard: Outfit font, blue `#465fff` accent, white 16px-rounded cards on a light grey page.

## 1. Principles

1. **Soft cards on grey.** A page is white cards (1px `gray-200` border, 16px radius, no shadow) on `gray-50`. Never nest cards in cards, accordions in cards, or tabs inside accordions.
2. **Blue means action or selection.** `brand-500` is for primary buttons, the active nav item, the active tab, links, and focus. Status uses its own colors (section 5). Everything else is grey.
3. **Say what a button does.** Buttons have text labels ("New project", "Add stage", "Save changes"). Icon-only buttons are allowed only for row actions (`⋯`), close buttons, and top bar icons, always with `aria-label` and a tooltip.
4. **Read first, edit on purpose.** Detail pages show values as text. Each section card has a rounded "Edit" button that opens a dialog with the form.
5. **Tokens, not overrides.** Colors, radius, and spacing come from `omcd-preset.ts` and the `@theme` block in `styles.css`. No `::ng-deep`, no hex values in components, no inline color styles. Use Tailwind classes such as `text-gray-500` and `bg-brand-50`, which match the tokens.

## 2. Tokens

### Color
| Role | Value | Tailwind | Use |
|---|---|---|---|
| Brand / primary | `#465fff` | `brand-500` | Primary buttons, active nav, active tab, links |
| Brand hover | `#3641f5` | `brand-600` | Hover on primary; text on `brand-50` |
| Brand tint | `#ecf3ff` | `brand-50` | Active nav background, info tags, selected rows |
| Page | `#f9fafb` | `gray-50` | Page background, table header band |
| Surface | `#ffffff` | `white` | Cards, sidebar, top bar, dialogs |
| Subtle fill | `#f2f4f7` | `gray-100` | Segmented control track, icon tiles, row dividers |
| Border | `#e4e7ec` | `gray-200` | Card, sidebar, and top bar borders |
| Input border | `#d0d5dd` | `gray-300` | Inputs and outline buttons |
| Text | `#1d2939` | `gray-800` | Values, names, headings |
| Label text | `#344054` | `gray-700` | Form labels, outline button text, nav items |
| Secondary text | `#667085` | `gray-500` | Table headers, field labels, subtitles, meta |
| Muted | `#98a2b3` | `gray-400` | Placeholders and "Not set" only (fails 4.5:1, never for real information) |

### Typography (Outfit; body 15px)
Tailwind's `text-xs` / `text-sm` / `text-base` are redefined in `styles.css` as 13 / 15 / 17px, so use those classes rather than pixel sizes.
| Style | Size / weight | Use |
|---|---|---|
| Page title | 20px / 600 | `.omcd-page-title`, one per page |
| Dialog title | 24px / 600 | Dialog headers |
| Card title | 18px / 600 | `.omcd-card-title` |
| KPI number | 30px / 700 (24px in compact cards) | `.omcd-kpi-value` |
| Body | 15px / 400 | Everything else |
| Value | 15px / 500 | `.omcd-field-value`, names in tables |
| Form label | 15px / 500, `gray-700` | `.omcd-form-label` |
| Field label, table header | 13px / 400–500, `gray-500` | `.omcd-field-label`, `<th>` |

Money and counts use `.omcd-num` (tabular, right-aligned) and the PLN pipe: `{{ v | currency:'PLN':'symbol':'1.2-2' }}` renders "50 000,00 zł".

### Shape and spacing
- Radius: 8px controls, 12px icon tiles and menus, 16px cards, 24px dialogs, full for tags and avatars.
- Controls are 44px tall (inputs, selects, buttons). Small buttons and segmented items are 36–40px.
- Gaps: 24px between cards and grid columns (`gap-6`), 24px card padding (`p-6`), 20px vertical card header padding (`py-5`).
- Shadows: only `shadow-theme-xs` on inputs, outline buttons, and the active segment, plus a soft overlay shadow on dialogs and menus.
- Focus: 4px soft blue halo (`shadow-focus-ring`), set in the preset.

## 3. App shell

- **Sidebar** (`--omcd-sidebar-w`, 290px): white, right border `gray-200`. The OMCD logo sits at the top. Groups are labelled in uppercase 12px `gray-500`: *Work* (Dashboard, Projects, Calendar), *People* (Architects, Clients, Contractors, Suppliers), *Finance* (Financial report).
  - Items: `.omcd-nav-item`, 14px medium `gray-700`, 8px radius, hover `gray-100`.
  - Active item: `.omcd-nav-item.active`, with `brand-50` background and `brand-500` text and icon.
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
- **Top bar** (76px): white with a bottom border. It holds a search field (44px, "Search or type command...", ⌘K hint) on the left, and on the right a round 44px notifications button plus the user avatar, name, and chevron.
- **Content:** 24px padding, max width 1536px.

## 4. Page templates

### Every page
`.omcd-page-header`: page title on the left, breadcrumb on the right (Home › Projects › Lublin 01).
Use `<omcd-page-header title="Project" [crumbs]="crumbs"/>` (`src/app/shared/page-header`) and set `data: {ownPageHeader: true}` on the page's route so the app shell hides its old breadcrumb bar. Read-only fields use `<omcd-field label="…" [value]="…"/>` (`src/app/shared/field`), which shows "Not set" (or `emptyText`) when empty.

### Dashboard
1. A row of KPI cards (`grid` with `minmax(240px, 1fr)`). Each has a 48px grey icon tile, a label, a 30px number, and a delta or context pill.
2. A chart card (title, subtitle, segmented Monthly / Quarterly / Annually) next to a summary card.
3. List cards ("Upcoming deadlines") next to table cards ("Unpaid installments").

### List page (Projects, Clients…)
1. Optional row of small KPI cards.
2. One card holding the table. Its header has the title and subtitle on the left; on the right sit a status segmented filter, a "Filter" outline button, and the primary "New project" button.
3. The table header band is `gray-50`. Rows have a checkbox and a two-line name (name in 500 `gray-800`, type in 12px `gray-500`). People appear as initials avatars plus name and role, followed by status pills, money right-aligned, and a `⋯` row menu.
4. The footer has "Showing 1–10 of N" plus Previous and Next buttons (`p-paginator` styled to match).

### Detail page (Project, Client…)
1. A header card with a 72px brand-tinted icon tile, the name (20px/600), a status pill, and a meta line with dividers (type | client | architect). Export and `⋯` sit on the right.
2. Routed sub-pages as a segmented control (`.omcd-seg`): Overview, Stages, Finance, Documents.
3. Two columns: the main column holds section cards (Contract, Project details, Stages); the side column (about 340px) holds the payments summary and People.
4. Section cards have the title on the left and a rounded "Edit" outline button with a pencil on the right. Fields sit in a 3-column grid with label above value. Empty values show "Not set" in `gray-400`.

### Edit dialog
`p-dialog` with 24px radius, about 700px wide, 32px padding. It has a title, a one-line description, and a round grey close button. The form is a 2-column grid with labels above 44px inputs, plus a "Cancel" outline button and a "Save changes" primary button on the bottom right.

## 5. Components

### Buttons
| Type | PrimeNG | Use |
|---|---|---|
| Primary | `<p-button label="New project" icon="pi pi-plus" />` | The main action. At most one per card or dialog. |
| Outline | `severity="secondary" [outlined]="true"` | Filter, Export, Cancel, See all |
| Edit | outline + `[rounded]="true"` + `icon="pi pi-pencil"` | Section card "Edit" |
| Danger | `severity="danger"` | Only inside delete confirmations |
| Row action | `icon="pi pi-ellipsis-h" [text]="true" [rounded]="true" severity="secondary"` + `pTooltip` | Table rows |

### Status tags (`p-tag`)
Pills, always through `statusSeverity()` in `src/app/shared/status-severity.ts`:

| Status (backend enum value) | Severity | Look |
|---|---|---|
| Offer (`OFFER`) | `secondary` | grey |
| To do (`TO_DO`), Accepted (`ACCEPTED`), Signed (`SIGNED`) | `info` | blue |
| In progress (`IN_PROGRESS`), Pending / Delete pending sync (`PENDING`, `DELETE_PENDING`) | `warn` | orange |
| Done (`DONE`), Completed (`COMPLETED`), Synced (`SYNCED`) | `success` | green |
| Rejected (`REJECTED`), Terminated (`TERMINATED`) | `danger` | red |

The keys come from the generated enums (`ProjectStatus`, `StageStatus`, `TaskStatus`, `ContractStatus`, `CalendarEventSyncStatus`). A new enum value fails to compile until it gets a severity in `status-severity.ts`. Labels come from the configuration entries via `resolveLabel()`. `contrast` (dark) is reserved for statuses that don't exist yet, such as "On hold".

When an entity has two statuses, label them explicitly: "Contract status" and "Project status".

### Forms
- `.omcd-form-label` above the input, in sentence case with no colon. Required fields get a red `*`.
- Inputs fill their cell (`class="w-full"` / `styleClass="w-full"`). Money uses `p-inputnumber` with a "zł" suffix. Dates use `p-datepicker dateFormat="dd.mm.yy" [showIcon]="true"`.
- Errors show a light-red border plus a 12px red message under the field that says what to fix ("End date must be after the start date").
- Hints show as a 12px `gray-500` line under the field.

### Empty states
Inside the card: a 56px grey circle with an icon, a 16px/600 title ("No stages yet"), one line of explanation, and, when not already in the card header, the create button.

### Feedback
- A toast after save or delete: "Contract saved".
- `p-confirmdialog` for destructive actions: "Delete Lublin 01? This can't be undone."
- `p-skeleton` while loading, shaped like the content.

## 6. Copy
- Sentence case: "Financial components", "Edit contract".
- Use "Net", never "Nett". Money is PLN, Polish format. Dates are `dd.mm.yyyy`.
- Name sections from the page's point of view: "Projects" on an architect page, not "Client projects".

## 7. Checklist before merging UI
- [ ] Cards: white, `gray-200` border, 16px radius, no shadow, never nested
- [ ] One primary (blue) button per card or dialog
- [ ] Statuses are `p-tag` pills through `statusSeverity()`
- [ ] Money is right-aligned, tabular, and in PLN format
- [ ] Every table has an empty state
- [ ] No hex colors, `::ng-deep`, or inline colors in components
- [ ] Icon-only buttons have `aria-label` and a tooltip
