import {defaultArchitectId} from './default-architect';
import {Architect} from "../generated/models/architect";

describe('defaultArchitectId', () => {
    const architects: Architect[] = [
        {id: 1, firstName: 'Karolina', lastName: 'Flis', linkedUser: {id: 10}},
        {id: 2, firstName: 'Oskar', lastName: 'Ciuryła'},
        {id: 3, firstName: 'Alicja', lastName: 'Ciuryła', linkedUser: {id: 30}}
    ];

    it('is the architect linked to the logged-in user, whoever the task belongs to', () => {
        expect(defaultArchitectId(architects, {id: 30}, 1)).toBe(3);
        expect(defaultArchitectId(architects, {id: 10}, undefined)).toBe(1);
    });

    it("is the task's architect when no architect is linked to the user", () => {
        expect(defaultArchitectId(architects, {id: 99}, 2)).toBe(2);
        expect(defaultArchitectId(architects, {}, 2)).toBe(2);
    });

    it("is unknown while the user or the architects aren't loaded, not the task's architect", () => {
        expect(defaultArchitectId(architects, null, 2)).toBeUndefined();
        expect(defaultArchitectId(null, {id: 30}, 2)).toBeUndefined();
        expect(defaultArchitectId([], {id: 30}, 2)).toBeUndefined();
    });
});
