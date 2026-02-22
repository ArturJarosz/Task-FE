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
- PrimeNG 19 (Lara theme preset) for UI components
- Tailwind CSS v4 + `tailwindcss-primeui` plugin for styling
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
  - `providePrimeNG({ theme: { preset: Lara, options: { darkModeSelector: false } } })` — PrimeNG theme
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

- **Global styles**: `src/styles.css` — imports Tailwind and the PrimeUI plugin:
  ```css
  @import "tailwindcss";
  @plugin "tailwindcss-primeui";
  ```
- **PostCSS**: `.postcssrc.json` configures `@tailwindcss/postcss`
- Use **Tailwind utility classes** for layout and spacing in templates (`flex`, `gap-4`, `w-full`, `text-surface-900`, etc.)
- PrimeNG theme tokens are available as CSS custom properties (`--p-surface-ground`, `--p-primary-color`, etc.)
- Do **not** use PrimeFlex — it has been removed
- Component-specific overrides can use `.less` or `.css` files alongside the component

### Generated Models

Models in `src/app/generated/models/` are auto-generated from backend OpenAPI spec. These are used for type safety and
code completion and should not be edited manually. Also they are used in API services.

- Do not manually edit these files
- Run `utils/generate-models.sh` to regenerate after backend changes

### Key Shared Utilities

- `src/app/shared/utils/date.utils.ts` - Date handling with `toDateIfExists()`, `toTimeZoneString()`
- `src/app/shared/utils/label.utils.ts` - `resolveLabel()` for enum/config label mapping
- `src/app/shared/configuration/` - Application configuration service and provider

### Environment

- Dev backend URL: `http://0.0.0.0:8100`
- Auth0 domain: `task-app-test.uk.auth0.com`
- Environment configs in `src/environments/`

### Important things to remember

- Always make all components **standalone** (`standalone: true`) — never create NgModule files
- Declare all dependencies explicitly in each component's `imports: [...]` array
- Use **Tailwind utility classes** for layout and spacing; do not use PrimeFlex
- Match the current visual style of existing components (buttons, inputs, spacing, PrimeNG components)
- PrimeNG 19 uses a theme preset system — component styling comes from the Lara preset and CSS variables
