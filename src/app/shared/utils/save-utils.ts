import {catchError, defer, EMPTY, finalize, Observable, tap} from "rxjs";

// Runs a store's save. Saving is on from the moment the request is sent, so a save queued behind another one keeps it
// on; afterSave runs only when the save worked, so a dialog stays open with what was typed after an error. The REST
// service already shows the error toast, and the error is swallowed to keep the store's rxMethod alive
export function runSave<T>(request: Observable<T>, setSaving: (saving: boolean) => void, onSaved: (saved: T) => void,
                           afterSave?: () => void): Observable<T> {
    return defer(() => {
        setSaving(true);
        return request.pipe(
            tap(saved => {
                onSaved(saved);
                afterSave?.();
            }),
            catchError(() => EMPTY),
            finalize(() => setSaving(false))
        );
    });
}
