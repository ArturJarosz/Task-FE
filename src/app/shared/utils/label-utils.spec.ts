import {resolveKnownLabel, resolveLabel} from './label-utils';

const ENTRIES = [{id: '100', label: 'Visualisations'}, {id: '101', label: 'Render'}];

describe('label-utils', () => {
    it('resolveLabel should fall back to the id when the entry is not listed', () => {
        expect(resolveLabel(100, ENTRIES)).toBe('Visualisations');
        expect(resolveLabel(102, ENTRIES)).toBe('102');
    });

    it('resolveKnownLabel should match numeric ids by their string form', () => {
        expect(resolveKnownLabel(101, ENTRIES)).toBe('Render');
    });

    it('resolveKnownLabel should show nothing while the entry is not listed yet', () => {
        expect(resolveKnownLabel(102, ENTRIES)).toBe('');
        expect(resolveKnownLabel(100, [])).toBe('');
        expect(resolveKnownLabel(100, null)).toBe('');
        expect(resolveKnownLabel(undefined, ENTRIES)).toBe('');
    });
});
