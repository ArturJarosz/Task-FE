import {brandPalette, contrastRatio, contrastTextColor, isHexColor, isLowContrastBrandColor, normalizeHexColor} from './theme-colors';

describe('theme colors', () => {
    it('should accept only six digit hex colors', () => {
        expect(isHexColor('#465fff')).toBeTrue();
        expect(isHexColor('#ABCDEF')).toBeTrue();
        expect(isHexColor('465fff')).toBeFalse();
        expect(isHexColor('#fff')).toBeFalse();
        expect(isHexColor('blue')).toBeFalse();
        expect(isHexColor(undefined)).toBeFalse();
    });

    it('should normalize typed colors to lower case with a hash', () => {
        expect(normalizeHexColor(' 465FFF ')).toBe('#465fff');
        expect(normalizeHexColor('#ABCDEF')).toBe('#abcdef');
    });

    it('should build a palette with the picked color as shade 500', () => {
        let shades = brandPalette('#0f766e');

        expect(shades[500]).toBe('#0f766e');
        expect(Object.keys(shades).length).toBe(11);
        expect(contrastRatio(shades[50], '#ffffff')).toBeLessThan(contrastRatio(shades[950], '#ffffff'));
    });

    it('should pick the text color that reads better on a fill', () => {
        expect(contrastTextColor('#465fff')).toBe('#ffffff');
        expect(contrastTextColor('#fde047')).toBe('#101828');
    });

    it('should flag brand colors too light for links on the cards', () => {
        expect(isLowContrastBrandColor('#465fff')).toBeFalse();
        expect(isLowContrastBrandColor('#fde047')).toBeTrue();
    });

    it('should compute WCAG contrast ratios', () => {
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
        expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    });
});
