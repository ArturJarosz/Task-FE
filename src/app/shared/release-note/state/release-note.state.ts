import {AppState} from "../../../state/app.store";
import {ReleaseNote} from "../../../generated/models/release-note";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {ReleaseNoteRestService} from "../rest/release-note-rest.service";
import {inject} from "@angular/core";
import {catchError, concatMap, EMPTY, pipe, switchMap, tap} from "rxjs";

// Which notes the "What's new" dialog shows: the ones the user hasn't seen yet, or all of them
export type WhatsNewMode = 'unseen' | 'history';

export interface ReleaseNoteState extends AppState {
    // Notes of the open dialog, newest first
    releaseNotes: ReleaseNote[];
    // Start of the period the notes cover; null while unknown
    since: string | null;
    // null while the dialog is closed
    mode: WhatsNewMode | null;
    releaseNotesLoading: boolean;
    releaseNotesLoadFailed: boolean;
    // Newest note marked as seen during this visit; 0 for none
    markedSeenId: number;
}

// The dialog part of the state, as when the dialog is closed
const CLOSED_DIALOG: Omit<ReleaseNoteState, 'markedSeenId'> = {
    releaseNotes: [],
    since: null,
    mode: null,
    releaseNotesLoading: false,
    releaseNotesLoadFailed: false
}

export const initialState: ReleaseNoteState = {...CLOSED_DIALOG, markedSeenId: 0}

export const ReleaseNoteStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, releaseNoteRestService = inject(ReleaseNoteRestService)) => ({
        // Opens the dialog only when there is something new; never replaces a dialog the user has already opened
        loadUnseen: rxMethod<{}>(
            pipe(
                switchMap(() => releaseNoteRestService.getUnseenReleaseNotes()
                    .pipe(
                        tap(unseen => {
                            const releaseNotes = unseen.releaseNotes ?? [];
                            if (releaseNotes.length > 0 && store.mode() === null) {
                                patchState(store, {releaseNotes, since: unseen.since ?? null, mode: 'unseen'});
                            }
                        }),
                        catchError(() => EMPTY)
                    ))
            )
        ),
        openHistory: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {...CLOSED_DIALOG, mode: 'history', releaseNotesLoading: true})),
                switchMap(() => releaseNoteRestService.getReleaseNotes()
                    .pipe(
                        // A response arriving after the user closed the dialog is dropped; the history starts with
                        // the oldest note, the last one
                        tap(releaseNotes => {
                            if (store.mode() === 'history') {
                                patchState(store, {
                                    releaseNotes, since: releaseNotes.at(-1)?.createdDateTime ?? null,
                                    releaseNotesLoading: false
                                });
                            }
                        }),
                        // The REST service already shows the error toast; keep the stream alive for the next load
                        catchError(() => {
                            if (store.mode() === 'history') {
                                patchState(store, {releaseNotesLoading: false, releaseNotesLoadFailed: true});
                            }
                            return EMPTY;
                        })
                    ))
            )
        ),
        // One request after another, so closing the dialog again never cancels the previous save
        markSeen: rxMethod<number>(
            pipe(
                concatMap(lastSeenId => releaseNoteRestService.markReleaseNotesSeen(lastSeenId)
                    .pipe(catchError(() => EMPTY)))
            )
        ),
    })),
    withMethods(store => ({
        // Everything the dialog showed counts as seen, so the same notes don't pop up on the next visit; it is only
        // saved when the dialog showed a note newer than the ones already marked
        close() {
            const markedSeenId = Math.max(store.markedSeenId(),
                ...store.releaseNotes().map(releaseNote => releaseNote.id ?? 0));
            if (markedSeenId > store.markedSeenId()) {
                store.markSeen(markedSeenId);
            }
            patchState(store, {...CLOSED_DIALOG, markedSeenId});
        }
    }))
)
