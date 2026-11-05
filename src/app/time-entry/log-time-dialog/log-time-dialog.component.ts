import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from "@angular/forms";
import {parseISO, startOfDay, startOfToday} from "date-fns";
import {ButtonModule} from "primeng/button";
import {DatePickerModule} from "primeng/datepicker";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {SelectModule} from "primeng/select";
import {Architect} from "../../generated/models/architect";
import {TimeEntry} from "../../generated/models/time-entry";
import {DurationPipe} from "../../shared/duration/duration.pipe";
import {
    DURATION_PROBLEM_MESSAGES,
    durationProblem,
    DurationProblem,
    parseDuration,
    toDurationInput
} from "../../shared/duration/duration-input";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {changedFields, isControlInvalid, showErrors} from "../../shared/utils/form-utils";

// The backend's limit for a time entry
export const NOTE_MAX_LENGTH = 255;

export interface LogTimeForm {
    workDate: FormControl<Date | null>;
    architectId: FormControl<number | null>;
    // As typed: 12h30m, 2h, 45m, or a number of hours
    duration: FormControl<string | null>;
    note: FormControl<string | null>;
}

type LogTimeFormValue = ReturnType<FormGroup<LogTimeForm>['getRawValue']>;

// Compared to tell whether an edited entry changed; the duration by its minutes, so "2h" and "120m" are the same
type LogTimeComparedValue = Omit<LogTimeFormValue, 'duration'> & { durationMinutes: number | null };

const COMPARED_FIELDS: (keyof LogTimeComparedValue)[] = ['workDate', 'architectId', 'durationMinutes', 'note'];

// The typed time: readable as a duration, at least a minute and at most a day. It is checked on the form, not on the
// field, so the field is not marked invalid while a time like "2.5" is half typed; durationError marks it on leaving.
function durationValidator(form: AbstractControl): ValidationErrors | null {
    const problem = durationProblem(form.get('duration')?.value);
    return problem ? {duration: problem} : null;
}

// Logs time on a task (an entry with no id) or edits an entry; used on the task page and in the stage's task list
@Component({
    selector: 'log-time-dialog',
    templateUrl: './log-time-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, DatePickerModule, InputTextModule, SelectModule, ReactiveFormsModule,
        DurationPipe]
})
export class LogTimeDialogComponent implements OnChanges {
    // The dialog is open while an entry is set. A new one carries its default architect (defaultArchitectId)
    @Input()
    timeEntry: TimeEntry | null = null;
    @Input()
    taskName: string = '';
    @Input()
    architects: Architect[] | null = [];
    @Input()
    saving = false;

    @Output()
    save = new EventEmitter<TimeEntry>();
    @Output()
    closed = new EventEmitter<void>();

    @ViewChild('durationInput')
    durationInput?: ElementRef<HTMLInputElement>;

    readonly noteMaxLength = NOTE_MAX_LENGTH;
    // The backend refuses work dates in the future. Set when the dialog opens, so a page left open overnight still
    // allows today
    today: Date = startOfToday();
    architectOptions: { id: number, name: string }[] = [];

    readonly form = new FormGroup<LogTimeForm>({
        workDate: new FormControl<Date | null>(null,
            [Validators.required, control => this.isAfterToday(control.value) ? {afterToday: true} : null]),
        architectId: new FormControl<number | null>(null, [Validators.required]),
        duration: new FormControl<string | null>(null),
        note: new FormControl<string | null>(null, [Validators.maxLength(NOTE_MAX_LENGTH)]),
    }, {validators: durationValidator});
    private initialValue!: LogTimeComparedValue;

    get visible(): boolean {
        return this.timeEntry !== null;
    }

    get isNew(): boolean {
        return this.timeEntry?.id == null;
    }

    get canSave(): boolean {
        return this.form.valid && this.hasChanges && !this.saving;
    }

    // Save is disabled only while an edited entry is unchanged: errors show once it is pressed
    get hasChanges(): boolean {
        return this.isNew || changedFields(this.initialValue, this.comparedValue(), COMPARED_FIELDS).length > 0;
    }

    get workDateError(): string | null {
        const workDate = this.form.controls.workDate;
        if (!isControlInvalid(this.form, 'workDate')) {
            return null;
        }
        return workDate.hasError('afterToday') ? `The date can't be after today` : 'Select the date of the work';
    }

    // The minutes the typed time stands for, while it can be read; shown under the field so the user sees how it was
    // understood
    get durationMinutes(): number | null {
        return this.form.hasError('duration') ? null : parseDuration(this.form.controls.duration.value);
    }

    // Shown once the user left the field, so a half-typed time ("2.") is not flagged while typing
    get durationError(): string | null {
        const problem: DurationProblem | null = this.form.getError('duration');
        return this.form.controls.duration.touched && problem ? DURATION_PROBLEM_MESSAGES[problem] : null;
    }

    isFieldInvalid(path: keyof LogTimeForm): boolean {
        return isControlInvalid(this.form, path);
    }

    // Only a newly opened entry resets the form: saving keeps what was typed
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['architects']) {
            this.architectOptions = (this.architects ?? []).map(architect =>
                ({id: architect.id!, name: `${architect.firstName} ${architect.lastName}`}));
        }
        if (changes['timeEntry'] && this.timeEntry) {
            this.resetForm(this.timeEntry);
        }
    }

    onSave(): void {
        if (!this.canSave) {
            showErrors(this.form);
            return;
        }
        const value = this.form.getRawValue();
        this.save.emit({
            id: this.timeEntry?.id,
            workDate: toTimeZoneString(value.workDate!),
            architectId: value.architectId!,
            durationMinutes: parseDuration(value.duration)!,
            note: value.note?.trim() || undefined,
        });
    }

    onHide(): void {
        this.closed.emit();
    }

    focusDuration(): void {
        this.durationInput?.nativeElement.focus();
    }

    private resetForm(timeEntry: TimeEntry): void {
        this.today = startOfToday();
        this.form.reset({
            workDate: timeEntry.workDate ? parseISO(timeEntry.workDate) : this.today,
            architectId: timeEntry.architectId ?? null,
            duration: timeEntry.durationMinutes != null ? toDurationInput(timeEntry.durationMinutes) : null,
            note: timeEntry.note ?? null,
        });
        this.initialValue = this.comparedValue();
    }

    private comparedValue(): LogTimeComparedValue {
        const {duration, ...value} = this.form.getRawValue();
        return {...value, durationMinutes: parseDuration(duration)};
    }

    private isAfterToday(date: Date | null): boolean {
        return !!date && startOfDay(date) > this.today;
    }
}
