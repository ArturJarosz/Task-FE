import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, pipe, switchMap, tap} from "rxjs";
import {MessageSeverity} from "../../shared";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ContractorCategory} from "../../generated/models/contractor-category";
import {ContractorCategoryRestService} from "../rest/contractor-category-rest.service";

export interface ContractorCategoryState extends AppState {
    contractorCategories: ContractorCategory[];
    // True once the list was loaded; later loads refresh it in place
    contractorCategoriesLoaded: boolean;
    contractorCategoriesLoadFailed: boolean;
    // A create or rename is being saved
    contractorCategorySaving: boolean;
    // Id of the contractor category being deleted
    contractorCategoryDeleting: number | null;
}

const initialState: ContractorCategoryState = {
    contractorCategories: [],
    contractorCategoriesLoaded: false,
    contractorCategoriesLoadFailed: false,
    contractorCategorySaving: false,
    contractorCategoryDeleting: null,
}

export const ContractorCategoryStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, contractorCategoryRestService = inject(ContractorCategoryRestService),
                 configurationStore = inject(ConfigurationStore), messageService = inject(MessageService)) => {
        const loadContractorCategories = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {contractorCategoriesLoadFailed: false})),
                switchMap(() => contractorCategoryRestService.getContractorCategories()
                    .pipe(
                        tap(contractorCategories => patchState(store,
                            {contractorCategories: contractorCategories, contractorCategoriesLoaded: true})),
                        // The REST service already shows the error toast; keep the stream alive for the next load
                        catchError(() => {
                            patchState(store, {contractorCategoriesLoadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        );
        // Categories are listed in the application configuration too (contractor forms and the contractor list), which
        // every page using them loads when it opens
        const afterChange = (summary: string) => {
            messageService.add({severity: MessageSeverity.INFO, summary: summary});
            loadContractorCategories();
            configurationStore.markConfigurationStale();
        };
        return {
            loadContractorCategories: loadContractorCategories,
            // afterSave runs only when the save worked, so a dialog stays open with what was typed after an error
            saveContractorCategory: rxMethod<{ contractorCategory: ContractorCategory, afterSave?: () => void }>(
                pipe(
                    concatMap(({contractorCategory, afterSave}) => {
                        patchState(store, {contractorCategorySaving: true});
                        let request = contractorCategory.id != null
                            ? contractorCategoryRestService.updateContractorCategory(contractorCategory.id,
                                contractorCategory)
                            : contractorCategoryRestService.createContractorCategory(contractorCategory);
                        return request.pipe(
                            tap(saved => {
                                afterChange(`${saved.name} saved`);
                                afterSave?.();
                            }),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {contractorCategorySaving: false}))
                        );
                    })
                )
            ),
            deleteContractorCategory: rxMethod<ContractorCategory>(
                pipe(
                    concatMap(contractorCategory => {
                        patchState(store, {contractorCategoryDeleting: contractorCategory.id!});
                        return contractorCategoryRestService.deleteContractorCategory(contractorCategory.id!).pipe(
                            tap(() => afterChange(`${contractorCategory.name} deleted`)),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {contractorCategoryDeleting: null}))
                        );
                    })
                )
            ),
        };
    })
)
