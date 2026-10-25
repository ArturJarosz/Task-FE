import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {SelectModule} from "primeng/select";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";
import {SkeletonModule} from "primeng/skeleton";
import {EmptyStateComponent} from "../../shared";
import {CalendarShare} from "../../generated/models/calendar-share";
import {CalendarShareRole} from "../../generated/models/calendar-share-role";
import {statusSeverity} from "../../shared/status-severity";

const ROLE_LABELS: Record<CalendarShareRole, string> = {
    READER: 'Can view',
    WRITER: 'Can edit',
    FREE_BUSY_READER: 'Free/busy only',
    OWNER: 'Owner',
};

// Other roles can be given only in Google
const ROLE_OPTIONS = [
    {label: 'Can view', value: CalendarShareRole.READER},
    {label: 'Can edit', value: CalendarShareRole.WRITER},
];

// Pasted emails often come with spaces around them, which are dropped when sharing, so both checks run on the
// trimmed value: spaces alone are no email
function trimmedEmailValidator(control: AbstractControl<string>): ValidationErrors | null {
    let trimmed = {value: control.value?.trim() ?? ''} as AbstractControl;
    return Validators.required(trimmed) ?? Validators.email(trimmed);
}

@Component({
    selector: 'google-calendar-shares',
    templateUrl: './google-calendar-shares.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, TagModule, SkeletonModule,
        EmptyStateComponent]
})
export class GoogleCalendarSharesComponent implements OnChanges {
    @Input()
    shares: CalendarShare[] = [];
    @Input()
    loading = false;
    @Input()
    loadFailed = false;
    @Input()
    adding = false;
    // Email whose access is being revoked
    @Input()
    revoking: string | null = null;

    @Output()
    add = new EventEmitter<CalendarShare>();
    @Output()
    revoke = new EventEmitter<CalendarShare>();
    @Output()
    retry = new EventEmitter<void>();

    readonly roleOptions = ROLE_OPTIONS;
    protected readonly statusSeverity = statusSeverity;

    readonly form = new FormGroup({
        email: new FormControl('', {nonNullable: true, validators: [trimmedEmailValidator]}),
        role: new FormControl<CalendarShareRole>(CalendarShareRole.READER, {nonNullable: true}),
    });

    ngOnChanges(changes: SimpleChanges): void {
        // The form is cleared once the person it was filled for shows up in the list
        if (changes['shares'] && this.isShared(this.form.controls.email.value)) {
            this.form.reset();
        }
    }

    roleLabel(role: CalendarShareRole | undefined): string {
        return ROLE_LABELS[role ?? CalendarShareRole.READER];
    }

    // Access the application cannot give back (owner, free/busy) is managed only in Google
    canRevoke(share: CalendarShare): boolean {
        return ROLE_OPTIONS.some(option => option.value === share.role);
    }

    get alreadyShared(): boolean {
        return this.isShared(this.form.controls.email.value);
    }

    get canAdd(): boolean {
        return this.form.valid && !this.alreadyShared && !this.adding;
    }

    onAdd(): void {
        if (!this.canAdd) {
            this.form.markAllAsTouched();
            return;
        }
        let value = this.form.getRawValue();
        this.add.emit({email: value.email.trim(), role: value.role});
    }

    private isShared(email: string): boolean {
        let normalized = email.trim().toLowerCase();
        return !!normalized && this.shares.some(share => share.email?.toLowerCase() === normalized);
    }
}
