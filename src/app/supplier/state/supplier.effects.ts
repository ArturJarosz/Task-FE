import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {SupplierRestService} from "../rest/suppplier-rest.service";
import {MessageService} from "primeng/api";
import {loadSuppliers, loadSuppliersError, loadSuppliersSuccess} from "./supplier.actions";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../shared";

@Injectable()
export class SupplierEffects {
    constructor(private actions$: Actions, private supplierRestService: SupplierRestService, private messageService: MessageService) {
    };

    loadSuppliers$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadSuppliers),
            mergeMap(() => this.supplierRestService.getSuppliers().pipe(
                map(suppliers => loadSuppliersSuccess({suppliers: suppliers})),
                catchError(error => {
                    this.messageService.add({
                        severity: MessageSeverity.ERROR,
                        summary: "Error loading suppliers.",
                        detail: `There was a problem with loading suppliers.`
                    });
                    return of(loadSuppliersError({error: error}))
                })
            ))
        )
    })
}
