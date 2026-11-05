// Values travel as strings; the parameter type says how to show and edit them
export enum SystemParameterType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    DECIMAL_NUMBER = 'DECIMAL_NUMBER',
    BOOLEAN = 'BOOLEAN',
    // The value is never sent to the browser, only valueSet
    SECRET = 'SECRET',
}

export function isNumericParameter(type: string | undefined): boolean {
    return type === SystemParameterType.NUMBER || type === SystemParameterType.DECIMAL_NUMBER;
}

// The tax parameters are rates. The backend keeps these names as keys and stores the fraction (0.23); the app
// names them as rates and shows and edits them as percentages ("23%")
const RATE_LABELS: Record<string, string> = {
    'Vat tax': 'VAT rate',
    'Income tax': 'Income tax rate',
};

export function parameterLabel(name: string | undefined): string {
    return (name && RATE_LABELS[name]) || name || '';
}

export function isRateParameter(name: string | undefined): boolean {
    return !!name && name in RATE_LABELS;
}

// 0.23 -> 23 and back, without floating point noise such as 23.000000000000004
export function fractionToPercent(fraction: number): number {
    return Math.round(fraction * 1_000_000) / 10_000;
}

export function percentToFraction(percent: number): number {
    return Math.round(percent * 10_000) / 1_000_000;
}

export function formatParameterValue(value: string, type: string | undefined, name?: string): string {
    if (type === SystemParameterType.BOOLEAN) {
        return value === 'true' ? 'On' : 'Off';
    }
    let number = Number(value);
    if (!isNumericParameter(type) || value.trim() === '' || isNaN(number)) {
        return value;
    }
    if (isRateParameter(name)) {
        return `${fractionToPercent(number).toLocaleString('pl-PL', {maximumFractionDigits: 2})}%`;
    }
    return number.toLocaleString('pl-PL', {maximumFractionDigits: 4});
}
