import {AppState} from "../../state/app.store";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {AbstractType, computed, inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, pipe, switchMap, tap} from "rxjs";
import {MessageSeverity} from "../../shared";
import {ConfigurationStore} from "../../shared/configuration/state";
import {NamedEntry} from "../named-entry";
import {NamedEntryDto, NamedEntryRestService} from "../rest/named-entry-rest.service";

export interface NamedEntryState extends AppState {
    entries: NamedEntry[];
    // True once the list was loaded; later loads refresh it in place
    entriesLoaded: boolean;
    entriesLoadFailed: boolean;
    // A create or rename is being saved
    entrySaving: boolean;
    // Id of the entry being deleted
    entryDeleting: number | null;
}

const initialState: NamedEntryState = {
    entries: [],
    entriesLoaded: false,
    entriesLoadFailed: false,
    entrySaving: false,
    entryDeleting: null,
}

/**
 * Store of one configurable list that is only a name each (project types, cost categories...), loaded through
 * restService. usageCount reads how many items (projects, costs...) use an entry, as a used entry can't be deleted.
 */
export function createNamedEntryStore<T extends NamedEntryDto>(restService: AbstractType<NamedEntryRestService<T>>,
                                                              usageCount: (entry: T) => number | undefined) {
    return signalStore(
        {providedIn: 'root'},
        withState(initialState),
        withComputed(({entriesLoaded, entriesLoadFailed}) => ({
            entriesLoading: computed(() => !entriesLoaded() && !entriesLoadFailed()),
        })),
        withMethods((store, entryRestService = inject(restService),
                     configurationStore = inject(ConfigurationStore), messageService = inject(MessageService)) => {
            const loadEntries = rxMethod<void>(
                pipe(
                    tap(() => patchState(store, {entriesLoadFailed: false})),
                    switchMap(() => entryRestService.getEntries()
                        .pipe(
                            tap(entries => patchState(store, {
                                entries: entries.map(entry =>
                                    ({id: entry.id, name: entry.name, usageCount: usageCount(entry)})),
                                entriesLoaded: true
                            })),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {entriesLoadFailed: true});
                                return EMPTY;
                            })
                        ))
                )
            );
            // The entries are listed in the application configuration too (forms, filters and labels), which every
            // page using them loads when it opens
            const afterChange = (summary: string) => {
                messageService.add({severity: MessageSeverity.INFO, summary: summary});
                loadEntries();
                configurationStore.markConfigurationStale();
            };
            return {
                loadEntries: loadEntries,
                // afterSave runs only when the save worked, so a dialog stays open with what was typed after an error
                saveEntry: rxMethod<{ entry: NamedEntry, afterSave?: () => void }>(
                    pipe(
                        concatMap(({entry, afterSave}) => {
                            patchState(store, {entrySaving: true});
                            let dto = {name: entry.name} as T;
                            let request = entry.id != null
                                ? entryRestService.updateEntry(entry.id, dto)
                                : entryRestService.createEntry(dto);
                            return request.pipe(
                                tap(saved => {
                                    afterChange(`${saved.name} saved`);
                                    afterSave?.();
                                }),
                                catchError(() => EMPTY),
                                finalize(() => patchState(store, {entrySaving: false}))
                            );
                        })
                    )
                ),
                deleteEntry: rxMethod<NamedEntry>(
                    pipe(
                        concatMap(entry => {
                            patchState(store, {entryDeleting: entry.id!});
                            return entryRestService.deleteEntry(entry.id!).pipe(
                                tap(() => afterChange(`${entry.name} deleted`)),
                                catchError(() => EMPTY),
                                finalize(() => patchState(store, {entryDeleting: null}))
                            );
                        })
                    )
                ),
            };
        })
    );
}

export type NamedEntryStore = InstanceType<ReturnType<typeof createNamedEntryStore>>;
