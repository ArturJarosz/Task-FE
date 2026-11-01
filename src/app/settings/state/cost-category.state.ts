import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, pipe, switchMap, tap} from "rxjs";
import {MessageSeverity} from "../../shared";
import {ConfigurationStore} from "../../shared/configuration/state";
import {CostCategory} from "../../generated/models/cost-category";
import {CostCategoryRestService} from "../rest/cost-category-rest.service";

export interface CostCategoryState extends AppState {
    costCategories: CostCategory[];
    // True once the list was loaded; later loads refresh it in place
    costCategoriesLoaded: boolean;
    costCategoriesLoadFailed: boolean;
    // A create or rename is being saved
    costCategorySaving: boolean;
    // Id of the cost category being deleted
    costCategoryDeleting: number | null;
}

const initialState: CostCategoryState = {
    costCategories: [],
    costCategoriesLoaded: false,
    costCategoriesLoadFailed: false,
    costCategorySaving: false,
    costCategoryDeleting: null,
}

export const CostCategoryStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, costCategoryRestService = inject(CostCategoryRestService),
                 configurationStore = inject(ConfigurationStore), messageService = inject(MessageService)) => {
        const loadCostCategories = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {costCategoriesLoadFailed: false})),
                switchMap(() => costCategoryRestService.getCostCategories()
                    .pipe(
                        tap(costCategories => patchState(store,
                            {costCategories: costCategories, costCategoriesLoaded: true})),
                        // The REST service already shows the error toast; keep the stream alive for the next load
                        catchError(() => {
                            patchState(store, {costCategoriesLoadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        );
        // Categories are listed in the application configuration too (cost forms and the cost list), which
        // every page using them loads when it opens
        const afterChange = (summary: string) => {
            messageService.add({severity: MessageSeverity.INFO, summary: summary});
            loadCostCategories();
            configurationStore.markConfigurationStale();
        };
        return {
            loadCostCategories: loadCostCategories,
            // afterSave runs only when the save worked, so a dialog stays open with what was typed after an error
            saveCostCategory: rxMethod<{ costCategory: CostCategory, afterSave?: () => void }>(
                pipe(
                    concatMap(({costCategory, afterSave}) => {
                        patchState(store, {costCategorySaving: true});
                        let request = costCategory.id != null
                            ? costCategoryRestService.updateCostCategory(costCategory.id,
                                costCategory)
                            : costCategoryRestService.createCostCategory(costCategory);
                        return request.pipe(
                            tap(saved => {
                                afterChange(`${saved.name} saved`);
                                afterSave?.();
                            }),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {costCategorySaving: false}))
                        );
                    })
                )
            ),
            deleteCostCategory: rxMethod<CostCategory>(
                pipe(
                    concatMap(costCategory => {
                        patchState(store, {costCategoryDeleting: costCategory.id!});
                        return costCategoryRestService.deleteCostCategory(costCategory.id!).pipe(
                            tap(() => afterChange(`${costCategory.name} deleted`)),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {costCategoryDeleting: null}))
                        );
                    })
                )
            ),
        };
    })
)
