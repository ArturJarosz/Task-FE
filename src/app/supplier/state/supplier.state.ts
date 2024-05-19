import {AppState} from "../../state/app.store";
import {Supplier} from "../../generated/models/supplier";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, of, pipe, switchMap, tap} from "rxjs";
import {MessageSeverity} from "../../shared";
import {SupplierRestService} from "../rest/suppplier-rest.service";

export interface SupplierState extends AppState {
    suppliers: Supplier[];
    supplier: Supplier | null;
    supplierId: number | undefined;
    suppliersNeedRefresh: boolean;
    supplierNeedsRefresh: boolean;
}

export const initialState: SupplierState = {
    suppliers: [],
    supplier: null,
    supplierId: undefined,
    suppliersNeedRefresh: true,
    supplierNeedsRefresh: true
}

export const SupplierStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, supplierRestService = inject(SupplierRestService), messageService = inject(MessageService)) => ({
            setSupplierId(supplierId: number) {
                patchState(store, {supplierId: supplierId});
            },
            loadSuppliers: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return supplierRestService.getSuppliers()
                            .pipe(
                                tap(suppliers => patchState(store,
                                    {suppliers: suppliers, suppliersNeedRefresh: false})),
                                catchError(error => {
                                    messageService.add({
                                        severity: MessageSeverity.ERROR,
                                        summary: `Error loading suppliers.`,
                                        detail: `There was a problem with loading suppliers.`,
                                    });
                                    return of(error);
                                })
                            )
                    })
                )
            ),
            loadSupplier: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return supplierRestService.getSupplier(store.supplierId()!)
                            .pipe(
                                tap(supplier => patchState(store,
                                    {supplier: supplier, supplierNeedsRefresh: false})),
                                catchError(error => {
                                    messageService.add({
                                        severity: MessageSeverity.ERROR,
                                        summary: `Error loading supplier.`,
                                        detail: `There was a problem with loading supplier with id: ${store.supplierId()}.`,
                                    });
                                    return of(error);
                                })
                            )
                    })
                )
            ),
            createSupplier: rxMethod<{ supplier: Supplier }>(
                pipe(
                    switchMap(({supplier}) => {
                        return supplierRestService.createSupplier(supplier)
                            .pipe(
                                tap(supplier => {
                                    patchState(store, {suppliersNeedRefresh: true});
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `New supplier created`,
                                        detail: `New supplier was created.`,
                                    });
                                })
                            )
                    })
                )
            ),
            updateSupplier: rxMethod<{ supplier: Supplier }>(
                pipe(
                    switchMap(({supplier}) => {
                        return supplierRestService.updateSupplier(store.supplierId()!, supplier)
                            .pipe(
                                tap(supplier => {
                                    patchState(store, {supplier: supplier, suppliersNeedRefresh: true});
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Supplier updated.`,
                                        detail: `Supplier ${supplier.name} was updated.`,
                                    });
                                })
                            )
                    })
                )
            ),
            deleteSupplier: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return supplierRestService.deleteSupplier(store.supplierId()!)
                            .pipe(
                                tap(supplier => {
                                    patchState(store, {suppliersNeedRefresh: true});
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Supplier removed.`,
                                        detail: `Supplier with id ${store.supplierId()!} was removed.`,
                                    });
                                })
                            )
                    })
                )
            )
        }))
)
