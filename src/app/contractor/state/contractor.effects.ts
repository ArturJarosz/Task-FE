import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {ContractorRestService} from "../rest/contractor-rest.service";
import {MessageService} from "primeng/api";
import {loadContractors, loadContractorsError, loadContractorsSuccess} from "./contractor.action";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../shared";

@Injectable()
export class ContractorEffects {
    constructor(private actions$: Actions, private contractorRestService: ContractorRestService, private messageService: MessageService) {

    };

    loadContractors$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadContractors),
            mergeMap(() => this.contractorRestService.getContractors().pipe(
                map(contractors => loadContractorsSuccess({contractors: contractors})),
                catchError(error => {
                    this.messageService.add({
                        severity: MessageSeverity.ERROR,
                        summary: "Error loading contractors.",
                        detail: `There was a problem with loading contractors.`
                    });
                    return of(loadContractorsError({error: error}))
                })
            ))
        )
    })
}
