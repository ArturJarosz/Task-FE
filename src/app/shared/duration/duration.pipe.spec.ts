import {TestBed} from '@angular/core/testing';

import {DurationPipe} from './duration.pipe';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('DurationPipe', () => {
    let pipe: DurationPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: [...provideTestDependencies(), DurationPipe]});
        pipe = TestBed.inject(DurationPipe);
    });

    it('should show hours and minutes', () => {
        expect(pipe.transform(750)).toBe('12 h 30 min');
        expect(pipe.transform(61)).toBe('1 h 1 min');
    });

    it('should leave out the hours when there are none', () => {
        expect(pipe.transform(45)).toBe('45 min');
    });

    it('should leave out the minutes on a full hour', () => {
        expect(pipe.transform(180)).toBe('3 h');
        expect(pipe.transform(1440)).toBe('24 h');
    });

    it('should show no time as 0 h', () => {
        expect(pipe.transform(0)).toBe('0 h');
    });

    it('should write the short format the way time is typed', () => {
        expect(pipe.transform(750, 'short')).toBe('12h 30m');
        expect(pipe.transform(45, 'short')).toBe('45m');
        expect(pipe.transform(180, 'short')).toBe('3h');
        expect(pipe.transform(0, 'short')).toBe('0h');
    });

    it('should show nothing for a missing value', () => {
        expect(pipe.transform(undefined)).toBe('');
        expect(pipe.transform(null)).toBe('');
    });
});
