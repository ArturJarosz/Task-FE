import {barLabel} from './timeline-scale';

describe('barLabel', () => {
    it('reads like the bar tooltip: name, dates, length and deadline', () => {
        const span = {start: new Date(2026, 4, 9), end: new Date(2026, 10, 5), open: true, label: '181 days so far'};
        expect(barLabel('Contract', span, new Date(2026, 9, 11)))
            .toBe('Contract, 09.05.2026 – no end date, 181 days so far, deadline 11.10.2026');
    });

    it('shows the end date of a closed bar and leaves out what is missing', () => {
        const span = {start: new Date(2026, 5, 1), end: new Date(2026, 5, 14), open: false, label: '14 days'};
        expect(barLabel('Projekt wykonawczy', span)).toBe('Projekt wykonawczy, 01.06.2026 – 14.06.2026, 14 days');
    });
});
