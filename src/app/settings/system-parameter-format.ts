// Values travel as strings; the parameter type says how to show and edit them
export enum SystemParameterType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    DECIMAL_NUMBER = 'DECIMAL_NUMBER',
}

export function isNumericParameter(type: string | undefined): boolean {
    return type === SystemParameterType.NUMBER || type === SystemParameterType.DECIMAL_NUMBER;
}

export function formatParameterValue(value: string, type: string | undefined): string {
    let number = Number(value);
    if (!isNumericParameter(type) || value.trim() === '' || isNaN(number)) {
        return value;
    }
    return number.toLocaleString('pl-PL', {maximumFractionDigits: 4});
}
