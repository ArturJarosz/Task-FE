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

- Angular 18 with TypeScript 5.4
- NgRx Signals for state management
- PrimeNG + PrimeFlex for UI components
- Auth0 for authentication
- Jasmine/Karma for testing
- LESS for styling

### Module Structure

Feature modules follow a consistent pattern:

```
src/app/{feature}/
├── {feature}.module.ts           # Module with routing
├── state/{feature}.state.ts      # NgRx Signal Store
├── rest/{feature}-rest.service.ts # API service
├── {feature}-shell/              # Smart component (handles state)
└── {feature}/                    # Presentational component
```

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

### Generated Models

Models in `src/app/generated/models/` are auto-generated from backend OpenAPI spec.

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
