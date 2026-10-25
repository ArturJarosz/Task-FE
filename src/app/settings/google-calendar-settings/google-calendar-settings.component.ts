import {
    ChangeDetectionStrategy,
    Component,
    computed,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import {DatePipe} from "@angular/common";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from "@angular/forms";
import {toSignal} from "@angular/core/rxjs-interop";
import {map, startWith} from "rxjs";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {InputTextModule} from "primeng/inputtext";
import {TextareaModule} from "primeng/textarea";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {MessageService} from "primeng/api";
import {EmptyStateComponent, MessageSeverity} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";
import {SystemParameter} from "../../generated/models/system-parameter";
import {GoogleCalendarConnection} from "../../generated/models/google-calendar-connection";
import {GoogleCalendarConnectionStatus} from "../../generated/models/google-calendar-connection-status";
import {parseServiceAccountKey} from "./service-account-key";
import {GoogleCalendarParameters} from "../google-calendar-parameters";

interface ConnectionText {
    label: string;
    hint: string;
}

const CONNECTION_TEXTS: Record<GoogleCalendarConnectionStatus, ConnectionText> = {
    CONNECTED: {label: 'Connected', hint: 'Google Calendar accepts the saved key'},
    DISABLED: {label: 'Off', hint: 'Sync is turned off, so the connection is not checked'},
    NOT_CONFIGURED: {label: 'Not configured', hint: 'Add a service account key and turn sync on to connect'},
    INVALID_CREDENTIALS: {
        label: 'Invalid key',
        hint: 'Google rejected the service account key. It may have been deleted or revoked, so add a new one'
    },
    PERMISSION_DENIED: {
        label: 'No access',
        hint: 'Google refused access. Check that the Google Calendar API is enabled in the key\'s Cloud project'
    },
    CALENDAR_NOT_FOUND: {
        label: 'Calendar missing',
        hint: 'The synced calendar was deleted or the service account lost access to it'
    },
    CONNECTION_FAILED: {label: 'Unreachable', hint: 'The server couldn\'t reach Google. Try again in a moment'},
};

const MAX_NAME_LENGTH = 255;
// Same limits as the backend: whole minutes, at most one day
export const MIN_INTERVAL_MINUTES = 1;
export const MAX_INTERVAL_MINUTES = 1440;
const DEFAULT_POLL_INTERVAL = '15';
const DEFAULT_PUSH_RETRY_INTERVAL = '1';
// Service account keys are about 2.3 kB; anything far bigger is the wrong file
const MAX_KEY_FILE_SIZE = 64 * 1024;

function serviceAccountKeyValidator(control: AbstractControl<string>): ValidationErrors | null {
    let value = control.value?.trim();
    return !value || parseServiceAccountKey(value) ? null : {serviceAccountKey: true};
}

function intervalValidator(control: AbstractControl<string>): ValidationErrors | null {
    let value = control.value?.trim() ?? '';
    let minutes = Number(value);
    return /^\d{1,4}$/.test(value) && minutes >= MIN_INTERVAL_MINUTES && minutes <= MAX_INTERVAL_MINUTES
        ? null : {interval: true};
}

// "05" and "5" are the same interval; saving and the hint use the plain number
function normalizeMinutes(value: string): string {
    let trimmed = value.trim();
    return /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed;
}

@Component({
    selector: 'google-calendar-settings',
    templateUrl: './google-calendar-settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ReactiveFormsModule, DatePipe, ToggleSwitchModule, InputTextModule, TextareaModule, ButtonModule,
        TagModule, SkeletonModule, TooltipModule, EmptyStateComponent]
})
export class GoogleCalendarSettingsComponent implements OnChanges {
    private readonly messageService = inject(MessageService);

    // The Google Calendar system parameters
    @Input()
    parameters: GoogleCalendarParameters | null = null;
    @Input()
    loading = false;
    @Input()
    loadFailed = false;
    @Input()
    saving = false;
    @Input()
    connection: GoogleCalendarConnection | null = null;
    @Input()
    connectionChecking = false;
    @Input()
    connectionCheckFailed = false;

    @Output()
    // Only the changed parameters, in the order they have to be saved
    save = new EventEmitter<SystemParameter[]>();
    @Output()
    checkConnection = new EventEmitter<void>();
    @Output()
    retry = new EventEmitter<void>();

    protected readonly statusSeverity = statusSeverity;

    readonly form = new FormGroup({
        enabled: new FormControl(false, {nonNullable: true}),
        calendarName: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/.*\S.*/), Validators.maxLength(MAX_NAME_LENGTH)]
        }),
        applicationName: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/.*\S.*/), Validators.maxLength(MAX_NAME_LENGTH)]
        }),
        // Empty keeps the saved key; the backend never sends the key back
        credentials: new FormControl('', {nonNullable: true, validators: [serviceAccountKeyValidator]}),
        pollInterval: new FormControl(DEFAULT_POLL_INTERVAL, {nonNullable: true, validators: [intervalValidator]}),
        pushRetryInterval: new FormControl(DEFAULT_PUSH_RETRY_INTERVAL,
            {nonNullable: true, validators: [intervalValidator]}),
    });

    protected readonly minIntervalMinutes = MIN_INTERVAL_MINUTES;
    protected readonly maxIntervalMinutes = MAX_INTERVAL_MINUTES;

    // The key field is shown when there is no saved key yet, or after "Replace key"
    replacingKey = false;
    // Parameters are saved one by one; the form is updated once the whole save is over, not after each of them
    private parametersBeforeSave: GoogleCalendarParameters | null = null;

    private readonly $formValue = toSignal(this.form.valueChanges.pipe(
        startWith(null),
        map(() => this.form.getRawValue())
    ), {requireSync: true});

    readonly $pastedKeyEmail = computed(() => {
        let credentials = this.$formValue().credentials.trim();
        return credentials ? parseServiceAccountKey(credentials)?.clientEmail ?? null : null;
    });

    get keySaved(): boolean {
        return !!this.parameters?.credentials?.valueSet;
    }

    // The backend never returns the key; the connection check tells whose it is
    get savedKeyEmail(): string | null {
        return this.keySaved ? this.connection?.serviceAccountEmail ?? null : null;
    }

    get keyForAnotherAccount(): boolean {
        let savedEmail = this.savedKeyEmail;
        let pastedEmail = this.$pastedKeyEmail();
        return !!savedEmail && !!pastedEmail && pastedEmail !== savedEmail;
    }

    get keyMissing(): boolean {
        let value = this.$formValue();
        return value.enabled && !this.keySaved && !value.credentials.trim();
    }

    get canSave(): boolean {
        return this.form.dirty && this.form.valid && !this.keyMissing && !this.saving;
    }

    // The names are set up once: the app creates its calendar with them, so they stay fixed while sync works
    get namesLocked(): boolean {
        return this.storedValues().enabled && this.connection?.status === GoogleCalendarConnectionStatus.CONNECTED;
    }

    // The saved interval, not the typed one: the hint describes how the sync runs now
    get storedPollInterval(): string {
        return normalizeMinutes(this.storedValues().pollInterval);
    }

    get connectionText(): ConnectionText | null {
        let status = this.connection?.status;
        return status ? CONNECTION_TEXTS[status] : null;
    }

    get showConnectionMessage(): boolean {
        let status = this.connection?.status;
        return !!this.connection?.message && status !== GoogleCalendarConnectionStatus.CONNECTED;
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Only newly loaded or saved parameters replace the form; flags changing must not drop what was typed
        let savingChange = changes['saving'];
        if (savingChange?.currentValue && !savingChange.previousValue) {
            this.parametersBeforeSave = this.parameters;
        } else if (savingChange?.previousValue && !savingChange.currentValue) {
            this.resetSavedControls();
        } else if (changes['parameters'] && !this.saving) {
            this.resetForm();
        }
        this.updateNamesLock();
    }

    onReplaceKey(): void {
        this.replacingKey = true;
    }

    onKeyFileSelected(event: Event): void {
        let input = event.target as HTMLInputElement;
        let file = input.files?.[0];
        // Clear the input, so picking the same file again still fires a change
        input.value = '';
        if (!file) {
            return;
        }
        if (file.size > MAX_KEY_FILE_SIZE) {
            this.messageService.add({
                severity: MessageSeverity.ERROR,
                summary: `${file.name} is too big for a service account key`,
            });
            return;
        }
        file.text().then(text => {
            let credentials = this.form.controls.credentials;
            credentials.setValue(text.trim());
            credentials.markAsDirty();
            this.form.markAsDirty();
        });
    }

    onCancel(): void {
        this.resetForm();
    }

    onSave(): void {
        if (!this.canSave) {
            this.form.markAllAsTouched();
            return;
        }
        let value = this.form.getRawValue();
        let stored = this.storedValues();
        // The key goes first and the sync last: turning the sync on is checked against the stored key
        let changes: [SystemParameter | undefined, string, string][] = [
            [this.parameters?.credentials, value.credentials.trim(), stored.credentials],
            [this.parameters?.calendarName, value.calendarName.trim(), stored.calendarName],
            [this.parameters?.applicationName, value.applicationName.trim(), stored.applicationName],
            [this.parameters?.pollInterval, normalizeMinutes(value.pollInterval), normalizeMinutes(stored.pollInterval)],
            [this.parameters?.pushRetryInterval, normalizeMinutes(value.pushRetryInterval),
                normalizeMinutes(stored.pushRetryInterval)],
            [this.parameters?.sync, String(value.enabled), String(stored.enabled)],
        ];
        let changed = changes.filter(([, newValue, storedValue]) => newValue !== storedValue);
        if (changed.some(([parameter]) => !parameter)) {
            this.messageService.add({
                severity: MessageSeverity.ERROR,
                summary: 'Google Calendar settings are missing on the server',
            });
            return;
        }
        if (changed.length > 0) {
            this.save.emit(changed.map(([parameter, newValue]) => ({...parameter!, value: newValue})));
        }
    }

    // What the form shows for the stored parameters; the key is never sent back, so its field starts empty
    private storedValues() {
        return {
            enabled: this.parameters?.sync?.value === 'true',
            calendarName: this.parameters?.calendarName?.value ?? '',
            applicationName: this.parameters?.applicationName?.value ?? '',
            credentials: '',
            pollInterval: this.parameters?.pollInterval?.value ?? DEFAULT_POLL_INTERVAL,
            pushRetryInterval: this.parameters?.pushRetryInterval?.value ?? DEFAULT_PUSH_RETRY_INTERVAL,
        };
    }

    // Locking drops a typed name too, as getRawValue would still save it
    private updateNamesLock(): void {
        let stored = this.storedValues();
        let controls = this.form.controls;
        let nameControls: [FormControl<string>, string][] = [
            [controls.calendarName, stored.calendarName],
            [controls.applicationName, stored.applicationName],
        ];
        for (let [control, storedValue] of nameControls) {
            if (this.namesLocked && control.enabled) {
                control.reset(storedValue);
                control.disable();
            } else if (!this.namesLocked && control.disabled) {
                control.enable();
            }
        }
    }

    private resetForm(): void {
        this.form.reset(this.storedValues());
        this.replacingKey = false;
    }

    // Only the fields whose parameter was stored take the stored value; the others keep what was typed, so a save
    // that stops at an error loses nothing
    private resetSavedControls(): void {
        let before = this.parametersBeforeSave;
        let stored = this.storedValues();
        let controls = this.form.controls;
        if (this.parameters?.sync !== before?.sync) {
            controls.enabled.reset(stored.enabled);
        }
        if (this.parameters?.calendarName !== before?.calendarName) {
            controls.calendarName.reset(stored.calendarName);
        }
        if (this.parameters?.applicationName !== before?.applicationName) {
            controls.applicationName.reset(stored.applicationName);
        }
        if (this.parameters?.pollInterval !== before?.pollInterval) {
            controls.pollInterval.reset(stored.pollInterval);
        }
        if (this.parameters?.pushRetryInterval !== before?.pushRetryInterval) {
            controls.pushRetryInterval.reset(stored.pushRetryInterval);
        }
        if (this.parameters?.credentials !== before?.credentials) {
            controls.credentials.reset(stored.credentials);
            this.replacingKey = false;
        }
        this.parametersBeforeSave = null;
    }
}
