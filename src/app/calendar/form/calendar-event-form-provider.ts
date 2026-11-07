import {Injectable} from "@angular/core";
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";

const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;

export function endAfterStartValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
        const start = group.get('startDateTime')?.value;
        const end = group.get('endDateTime')?.value;
        if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
            return {endBeforeStart: true};
        }
        return null;
    };
}

export interface CalendarEventFormDefaults {
    name?: string;
    description?: string;
    startDateTime?: Date;
    endDateTime?: Date;
    allDay?: boolean;
    clientId?: number;
    projectId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CalendarEventFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getCalendarEventFormGroup(defaults?: CalendarEventFormDefaults): FormGroup<CalendarEventForm> {
        const now = new Date();
        now.setSeconds(0, 0);
        const inAnHour = new Date(now.getTime() + DEFAULT_EVENT_DURATION_MS);
        return this.formBuilder.nonNullable.group<CalendarEventForm>({
            name: this.formBuilder.nonNullable.control<string>(defaults?.name ?? '', [Validators.required]),
            description: this.formBuilder.control<string | null>(defaults?.description ?? null),
            startDateTime: this.formBuilder.nonNullable.control<Date>(defaults?.startDateTime ?? now, [Validators.required]),
            endDateTime: this.formBuilder.nonNullable.control<Date>(defaults?.endDateTime ?? inAnHour, [Validators.required]),
            allDay: this.formBuilder.nonNullable.control<boolean>(defaults?.allDay ?? false),
            clientId: this.formBuilder.control<number | null>(defaults?.clientId ?? null),
            projectId: this.formBuilder.control<number | null>(defaults?.projectId ?? null),
        }, {validators: [endAfterStartValidator()]})
    }
}

export interface CalendarEventForm {
    name: FormControl<string>;
    description: FormControl<string | null>;
    startDateTime: FormControl<Date>;
    endDateTime: FormControl<Date>;
    allDay: FormControl<boolean>;
    clientId: FormControl<number | null>;
    projectId: FormControl<number | null>;
}
