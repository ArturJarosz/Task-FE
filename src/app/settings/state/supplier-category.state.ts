import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, pipe, switchMap, tap} from "rxjs";
import {MessageSeverity} from "../../shared";
import {ConfigurationStore} from "../../shared/configuration/state";
import {SupplierCategory} from "../../generated/models/supplier-category";
import {SupplierCategoryRestService} from "../rest/supplier-category-rest.service";

export interface SupplierCategoryState extends AppState {
    supplierCategories: SupplierCategory[];
    // True once the list was loaded; later loads refresh it in place
    supplierCategoriesLoaded: boolean;
    supplierCategoriesLoadFailed: boolean;
    // A create or rename is being saved
    supplierCategorySaving: boolean;
    // Id of the supplier category being deleted
    supplierCategoryDeleting: number | null;
}

const initialState: SupplierCategoryState = {
    supplierCategories: [],
    supplierCategoriesLoaded: false,
    supplierCategoriesLoadFailed: false,
    supplierCategorySaving: false,
    supplierCategoryDeleting: null,
}

export const SupplierCategoryStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, supplierCategoryRestService = inject(SupplierCategoryRestService),
                 configurationStore = inject(ConfigurationStore), messageService = inject(MessageService)) => {
        const loadSupplierCategories = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {supplierCategoriesLoadFailed: false})),
                switchMap(() => supplierCategoryRestService.getSupplierCategories()
                    .pipe(
                        tap(supplierCategories => patchState(store,
                            {supplierCategories: supplierCategories, supplierCategoriesLoaded: true})),
                        // The REST service already shows the error toast; keep the stream alive for the next load
                        catchError(() => {
                            patchState(store, {supplierCategoriesLoadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        );
        // Categories are listed in the application configuration too (supplier forms and the supplier list), which
        // every page using them loads when it opens
        const afterChange = (summary: string) => {
            messageService.add({severity: MessageSeverity.INFO, summary: summary});
            loadSupplierCategories();
            configurationStore.markConfigurationStale();
        };
        return {
            loadSupplierCategories: loadSupplierCategories,
            // afterSave runs only when the save worked, so a dialog stays open with what was typed after an error
            saveSupplierCategory: rxMethod<{ supplierCategory: SupplierCategory, afterSave?: () => void }>(
                pipe(
                    concatMap(({supplierCategory, afterSave}) => {
                        patchState(store, {supplierCategorySaving: true});
                        let request = supplierCategory.id != null
                            ? supplierCategoryRestService.updateSupplierCategory(supplierCategory.id,
                                supplierCategory)
                            : supplierCategoryRestService.createSupplierCategory(supplierCategory);
                        return request.pipe(
                            tap(saved => {
                                afterChange(`${saved.name} saved`);
                                afterSave?.();
                            }),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {supplierCategorySaving: false}))
                        );
                    })
                )
            ),
            deleteSupplierCategory: rxMethod<SupplierCategory>(
                pipe(
                    concatMap(supplierCategory => {
                        patchState(store, {supplierCategoryDeleting: supplierCategory.id!});
                        return supplierCategoryRestService.deleteSupplierCategory(supplierCategory.id!).pipe(
                            tap(() => afterChange(`${supplierCategory.name} deleted`)),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {supplierCategoryDeleting: null}))
                        );
                    })
                )
            ),
        };
    })
)
