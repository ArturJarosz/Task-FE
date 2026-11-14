import {avatarColor, initials, resolveKnownLabel, resolveLabel} from './label-utils';

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

describe('initials', () => {
    it('takes the first letters of the first two words', () => {
        expect(initials('Teodor Czerwiński')).toBe('TC');
        expect(initials('Oskar', 'Ciuryła')).toBe('OC');
    });

    it('skips words that start with a sign', () => {
        expect(initials('Ciuba & Partnerzy')).toBe('CP');
        expect(initials('Kow-Bud. Zakład remontowo - budowlany')).toBe('KZ');
    });

    it('uses one letter for one word and "?" for none', () => {
        expect(initials('IISKELO')).toBe('I');
        expect(initials('', null, undefined)).toBe('?');
    });
});

describe('avatarColor', () => {
    const IDS = [1, 2, 3, 4, 5, 17, 100, 101];

    it('gives clients shades of orange and architects shades of blue', () => {
        for (const id of IDS) {
            expect(avatarColor('client', id)).toMatch(/^bg-avatar-client-([1-4]) text-avatar-client-\1-ink$/);
            expect(avatarColor('architect', id)).toMatch(/^bg-avatar-architect-([1-4]) text-avatar-architect-\1-ink$/);
        }
    });

    it('gives a record the same shade every time, and neighbouring records different ones', () => {
        expect(avatarColor('client', 17)).toBe(avatarColor('client', 17));
        expect(new Set([1, 2, 3, 4].map(id => avatarColor('client', id))).size).toBe(4);
        expect(new Set([1, 2, 3, 4].map(id => avatarColor('architect', id))).size).toBe(4);
    });

    it('is grey without an id', () => {
        expect(avatarColor('architect', undefined)).toBe('bg-gray-100 text-gray-700');
        expect(avatarColor('client', null)).toBe('bg-gray-100 text-gray-700');
    });
});
