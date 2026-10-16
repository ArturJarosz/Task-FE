# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm start          # Dev server on port 8050
npm run build      # Production build (output: dist/task-fe)
npm test           # Run Jasmine tests via Karma
npm run watch      # Build in watch mode
```

**Regenerate models from backend OpenAPI spec:**

```bash
cd utils && ./generate-models.sh
```

Requires the backend repo at `../../Task/core/` with OpenAPI spec available.

## Architecture Overview

### Tech Stack

- Angular 19 with TypeScript 5.8
- NgRx Signals 19 for state management
- PrimeNG 19 (styled mode, `OmcdPreset` based on Aura) for UI components
- Tailwind CSS v4 + `tailwindcss-primeui` for styling, Outfit font, PrimeIcons only
- Auth0 for authentication
- Jasmine/Karma for testing

### Module Structure

All components are **standalone** — there are no NgModule files. Feature areas follow this structure:

```
src/app/{feature}/
├── state/{feature}.state.ts        # NgRx Signal Store
├── rest/{feature}-rest.service.ts  # API service
├── {feature}-list-shell/           # Smart component (loads data from store)
├── {feature}-list/                 # Presentational list component
├── {feature}-detail-shell/         # Smart component (loads single item)
├── {feature}-detail/               # Presentational detail/edit component
└── add-{feature}/                  # Add/create dialog component
```

### Standalone Components

Every component uses `standalone: true` and declares its own `imports` array. There are no shared `*.module.ts` files.

```typescript
@Component({
    selector: 'feature-list',
    templateUrl: './feature-list.component.html',
    standalone: true,
    imports: [WrapperComponent, TableModule, ButtonModule, RouterLink]
})
export class FeatureListComponent {
    @Input() items!: Item[];
}
```

Import PrimeNG modules individually per component (e.g. `TableModule` from `primeng/table`, `ButtonModule` from `primeng/button`).

### Bootstrap & Application Configuration

- **`src/main.ts`** — bootstraps with `bootstrapApplication(AppComponent, appConfig)`
- **`src/app/app.config.ts`** — all application-level providers:
  - `provideRouter(appRoutes)` — routing
  - `provideHttpClient(withInterceptors([authHttpInterceptorFn]))` — HTTP + Auth0
  - `providePrimeNG({ theme: { preset: OmcdPreset, options: { darkModeSelector: '.app-dark', cssLayer: {...} } } })` — PrimeNG theme
  - `LOCALE_ID` `'pl'` with `registerLocaleData(localePl)` — Polish money and date formats
  - `ConfirmationService`, `MessageService` and all REST services
- **`src/app/app.routes.ts`** — all routes; route guards use `canActivate: [loggedInGuardGuard]`

### State Management Pattern

Uses NgRx Signal Stores with `@ngrx/signals`:

```typescript
export const FeatureStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed(({data}) => ({
        derivedValue: computed(() => /* ... */)
    })),
    withMethods((store, restService = inject(RestService)) => ({
        loadData: rxMethod<{}>(
            pipe(
                switchMap(() => restService.getData()
                    .pipe(tap(data => patchState(store, {data}))))
            )
        ),
    }))
)
```

Key patterns:

- `xxxNeedsRefresh` flags control when data is fetched
- `patchState()` for state updates
- `rxMethod()` for async operations with RxJS

### Component Pattern

Shell/Presentational separation:

- **Shell components** (`*-shell/`): Inject stores, handle routing params, orchestrate data loading
- **Presentational components**: Receive data via `@Input()`, emit events via `@Output()`
- Use `ChangeDetectionStrategy.OnPush`

### REST Services

Extend `AbstractRestService` from `src/app/shared/rest/abstract-rest.service.ts`:

- Provides centralized error handling via `handleError()`
- Displays errors through PrimeNG MessageService

### Styling

**Read `DESIGN_GUIDELINES.md` before building or changing any UI.** It defines the tokens, app shell, page templates
(dashboard, list, detail, edit dialog), components, copy rules and the pre-merge checklist. If a screen needs something
it doesn't cover, add the rule there first, then build it.

- **PrimeNG preset**: `src/app/theme/omcd-preset.ts` — all component colors, radii and sizes. Change the look here.
- **Global styles**: `src/styles.css` — layer order, Outfit font, Tailwind, `tailwindcss-primeui`, the `@theme` palette
  (`brand-*`, `gray-*`, `success-*`, `warning-*`, `error-*`) and the reusable `.omcd-*` classes (`.omcd-card`,
  `.omcd-page-header`, `.omcd-field-label`, `.omcd-form-label`, `.omcd-seg`, `.omcd-num`...)
- **CSS layers**: PrimeNG renders into the `primeng` layer, ordered `theme, base, primeng, components, utilities`, so
  Tailwind utilities override PrimeNG without `!important`
- **PostCSS**: `.postcssrc.json` configures `@tailwindcss/postcss`
- Use **Tailwind utility classes** that match the tokens (`text-gray-500`, `bg-brand-50`, `border-gray-200`, `gap-6`, `p-6`)
- **No** `::ng-deep`, hex values, inline color styles or `!important` overrides in components
- **Status tags**: always `<p-tag>` with `statusSeverity()` from `src/app/shared/status-severity.ts`; it is keyed by the
  backend status enums, so a new enum value must get a severity there
- **Money**: `{{ v | currency:'PLN':'symbol':'1.2-2' }}` with `.omcd-num`. **Dates**: `dd.mm.yyyy`
- **Icons**: PrimeIcons (`pi pi-*`) only. Do **not** use PrimeFlex or Font Awesome — both have been removed
- **Dark mode**: off; `dark:` variants and PrimeNG dark tokens apply only under `<html class="app-dark">`

### Generated Models

Models in `src/app/generated/models/` are auto-generated from backend OpenAPI spec. These are used for type safety and
code completion and should not be edited manually. Also they are used in API services.

- Do not manually edit these files
- Run `utils/generate-models.sh` to regenerate after backend changes

### Key Shared Utilities

- `src/app/shared/utils/date-utils.ts` - Date handling with `toDateIfExists()`, `toTimeZoneString()`
- `src/app/shared/utils/label-utils.ts` - `resolveLabel()` for enum/config label mapping
- `src/app/shared/status-severity.ts` - `statusSeverity()` for `p-tag` colors of backend statuses
- `src/app/shared/configuration/` - Application configuration service and provider

### Environment

- Dev backend URL: `http://0.0.0.0:8100`
- Auth0 domain: `task-app-test.uk.auth0.com`
- Environment configs in `src/environments/`

### Important things to remember

- Always make all components **standalone** (`standalone: true`) — never create NgModule files
- Declare all dependencies explicitly in each component's `imports: [...]` array
- Follow `DESIGN_GUIDELINES.md` for every UI change and run through its checklist (section 7) before finishing
- Use **Tailwind utility classes** and the `.omcd-*` classes for layout and spacing; do not use PrimeFlex
- Style PrimeNG through `omcd-preset.ts` tokens, never with `::ng-deep` or hex values in components
- Buttons have text labels; at most one primary button per card or dialog; icon-only buttons need `aria-label` and `pTooltip`
- Copy is sentence case ("Edit contract", "New project"); use "Net", never "Nett"


### Docs
- Always use context7 to fetch up-to-date docs before implementing
- Always use https://v19.primeng.org/ as a source of documentation for PrimeNG related topics
