// Names of the fields whose value differs between two form snapshots (form.getRawValue()).
// Dates compare by time and empty values (null, undefined, '') count as equal.
export function changedFields<T extends object>(initial: T, current: T, fields: (keyof T)[]): (keyof T)[] {
    return fields.filter(field => !sameValue(initial[field], current[field]));
}

function sameValue(a: unknown, b: unknown): boolean {
    const normalize = (value: unknown) => {
        if (value instanceof Date) {
            return value.getTime();
        }
        return value === undefined || value === '' ? null : value;
    };
    return normalize(a) === normalize(b);
}
