import {AbstractControl, ValidationErrors} from "@angular/forms";

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

// True once the user has touched or changed an invalid field, so its error message can show.
export function isControlInvalid(form: AbstractControl, path: string): boolean {
    const control = form.get(path);
    return !!control && control.invalid && (control.touched || control.dirty);
}

// Form group validator: a paid item needs a payment date
export function paymentDateRequiredWhenPaid(group: AbstractControl): ValidationErrors | null {
    return group.get('paid')?.value && !group.get('paymentDate')?.value ? {paymentDateRequired: true} : null;
}

// True once the user has touched the payment date of a paid item and left it empty
export function isPaymentDateMissing(form: AbstractControl): boolean {
    return form.hasError('paymentDateRequired') && !!form.get('paymentDate')?.touched;
}
