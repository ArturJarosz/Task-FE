import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {ConfigurationRestService} from "../rest/configuration.rest";
import {MessageService} from "primeng/api";
import {loadConfiguration, loadConfigurationSuccess} from "./configuration.action";
import {catchError, filter, map, mergeMap, of, withLatestFrom} from "rxjs";
import {MessageSeverity} from "../../message";
import {loadClientsError} from "../../../client/state";
import {ConfigurationState, getNeedRefresh} from "./configuration.state";
import {Store} from "@ngrx/store";

@Injectable()
export class ConfigurationEffects {

    constructor(private actions$: Actions, private configurationRestService: ConfigurationRestService,
                private messageService: MessageService, private configurationStore: Store<ConfigurationState>) {
    };

    loadConfiguration$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadConfiguration),
            withLatestFrom(this.configurationStore.select(getNeedRefresh)),
            filter(([action, needs]) => needs),
            mergeMap(() =>
                this.configurationRestService.getConfiguration()
                    .pipe(
                        map(configuration =>
                            loadConfigurationSuccess({configuration: configuration})
                        ),
                        catchError(error => {
                            this.messageService.add({
                                severity: MessageSeverity.ERROR,
                                summary: "Error loading application configuration.",
                                detail: `There was a problem with loading application configuration.`
                            });
                            return of(loadClientsError({error: error}))
                        })
                    )
            )
        )
    })
}
