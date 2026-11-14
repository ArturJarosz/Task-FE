import {concatMap, of, Subject, throwError} from 'rxjs';

import {runSave} from './save-utils';

describe('runSave', () => {
    it('should run afterSave only when the save worked', () => {
        const savingStates: boolean[] = [];
        const onSaved = jasmine.createSpy('onSaved');
        const afterSave = jasmine.createSpy('afterSave');

        runSave(throwError(() => 'Response code: 400'), saving => savingStates.push(saving), onSaved, afterSave)
            .subscribe();

        expect(onSaved).not.toHaveBeenCalled();
        expect(afterSave).not.toHaveBeenCalled();
        expect(savingStates).toEqual([true, false]);

        runSave(of('saved'), saving => savingStates.push(saving), onSaved, afterSave).subscribe();

        expect(onSaved).toHaveBeenCalledWith('saved');
        expect(afterSave).toHaveBeenCalled();
    });

    it('should stay saving while a queued save waits for the one before it', () => {
        let saving = false;
        const first = new Subject<string>();
        const second = new Subject<string>();
        const saves = new Subject<Subject<string>>();
        saves.pipe(concatMap(request => runSave(request, value => saving = value, () => undefined)))
            .subscribe();

        saves.next(first);
        saves.next(second);
        first.next('first');
        first.complete();

        expect(saving).toBeTrue();

        second.next('second');
        second.complete();

        expect(saving).toBeFalse();
    });
});
