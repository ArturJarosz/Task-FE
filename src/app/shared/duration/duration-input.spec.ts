import {parseDuration, toDurationInput} from './duration-input';

describe('parseDuration', () => {
    it('should read hours and minutes with their units', () => {
        expect(parseDuration('12h30m')).toBe(750);
        expect(parseDuration('12h 30m')).toBe(750);
        expect(parseDuration('12 h 30 min')).toBe(750);
        expect(parseDuration('1 hour 5 minutes')).toBe(65);
        expect(parseDuration('2hrs 15mins')).toBe(135);
        expect(parseDuration(' 12H30M ')).toBe(750);
    });

    it('should read minutes without their unit after the hours', () => {
        expect(parseDuration('12h30')).toBe(750);
        expect(parseDuration('1h 5')).toBe(65);
    });

    it('should read only hours or only minutes', () => {
        expect(parseDuration('2h')).toBe(120);
        expect(parseDuration('45m')).toBe(45);
        expect(parseDuration('90min')).toBe(90);
    });

    it('should count a number without a unit as hours', () => {
        expect(parseDuration('2')).toBe(120);
        expect(parseDuration('24')).toBe(1440);
        expect(parseDuration('0')).toBe(0);
    });

    it('should read decimal hours with a dot or a comma', () => {
        expect(parseDuration('1.5')).toBe(90);
        expect(parseDuration('1,5')).toBe(90);
        expect(parseDuration('0.25h')).toBe(15);
        expect(parseDuration('1.5h 10m')).toBe(100);
    });

    it('should round fractions of a minute', () => {
        expect(parseDuration('0.33')).toBe(20);
        expect(parseDuration('10.6m')).toBe(11);
    });

    it('should not read text that is not a duration', () => {
        for (const text of ['h', 'm', 'abc', '2x', '30m2h', '2h3h', '1:30', '-1', '2.', '.5', 'h30m']) {
            expect(parseDuration(text)).withContext(text).toBeNull();
        }
    });

    it('should not read empty text', () => {
        expect(parseDuration('')).toBeNull();
        expect(parseDuration('   ')).toBeNull();
        expect(parseDuration(null)).toBeNull();
        expect(parseDuration(undefined)).toBeNull();
    });
});

describe('toDurationInput', () => {
    it('should write minutes the way they are typed', () => {
        expect(toDurationInput(750)).toBe('12h30m');
        expect(toDurationInput(180)).toBe('3h');
        expect(toDurationInput(45)).toBe('45m');
        expect(toDurationInput(null)).toBe('');
    });

    it('should be read back as the same minutes', () => {
        for (const minutes of [1, 45, 60, 61, 150, 1439, 1440]) {
            expect(parseDuration(toDurationInput(minutes))).toBe(minutes);
        }
    });
});
