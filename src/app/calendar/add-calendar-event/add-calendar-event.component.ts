import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CalendarEventForm, CalendarEventFormProvider} from "../form/calendar-event-form-provider";
import {CalendarEvent} from "../../generated/models/calendar-event";
import {Client} from "../../generated/models/client";
import {Project} from "../../generated/models/project";
import {clientDisplayName} from "../../client/model/client";
import {CalendarStore} from "../state";
import {EventSelection, GOOGLE_SYNC_ISSUES} from "../model/calendar.model";
import {toDateIfExists, toLocalDateTimeString} from "../../shared/utils/date-utils";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {DatePickerModule} from "primeng/datepicker";
import {SelectModule} from "primeng/select";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {ButtonModule} from "primeng/button";
import {showErrors} from "../../shared/utils/form-utils";

@Component({
    selector: 'add-calendar-event',
    templateUrl: './add-calendar-event.component.html',
    styleUrl: './add-calendar-event.component.less',
    standalone: true,
    imports: [DialogModule, InputTextModule, Textarea, DatePickerModule, SelectModule, ToggleSwitchModule, ButtonModule,
        ReactiveFormsModule]
})
export class AddCalendarEventComponent implements OnChanges {
    @Input()
    visible = false;
    @Input()
    event: CalendarEvent | null = null;
    @Input()
    prefillSelection: EventSelection | null = null;
    @Input()
    clients: Client[] = [];
    @Input()
    projects: Project[] = [];
    // A new event opened from a client's or project's page belongs to it, so these are preselected and locked
    @Input()
    fixedClientId?: number;
    @Input()
    fixedProjectId?: number;

    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output()
    deleteRequested: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

    readonly calendarStore = inject(CalendarStore);
    // Where the event goes while Google Calendar sync has an issue
    readonly syncIssueText = computed(() => {
        const issue = this.calendarStore.googleSyncIssue();
        return issue ? GOOGLE_SYNC_ISSUES[issue] : null;
    });

    calendarEventForm!: FormGroup<CalendarEventForm>;
    clientOptions: {id?: number, name: string}[] = [];
    // Only projects of the selected client
    projectOptions: Project[] = [];

    constructor(private formProvider: CalendarEventFormProvider) {
        this.calendarEventForm = this.formProvider.getCalendarEventFormGroup();
    }

    get title(): string {
        return this.event ? 'Edit event' : 'New event';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.resetFields();
        }
        if (changes['clients']) {
            this.clientOptions = this.clients.map(client => ({id: client.id, name: clientDisplayName(client)}));
        }
        if (changes['projects']) {
            this.updateProjectOptions();
        }
    }

    // A project stays selected only when it belongs to the new client
    onClientChange(): void {
        const clientId = this.calendarEventForm.controls.clientId.value;
        const project = this.projects.find(project => project.id === this.calendarEventForm.controls.projectId.value);
        if (project && project.client?.id !== clientId) {
            this.calendarEventForm.controls.projectId.setValue(null);
        }
        this.updateProjectOptions();
    }

    // A project has one client, so selecting the project selects its client too
    onProjectChange(): void {
        const project = this.projects.find(project => project.id === this.calendarEventForm.controls.projectId.value);
        if (project?.client?.id) {
            this.calendarEventForm.controls.clientId.setValue(project.client.id);
        }
        this.updateProjectOptions();
    }

    onClose(): void {
        this.notify.emit(false);
        this.resetFields();
    }

    onCancel(): void {
        this.visible = false;
        this.notify.emit(false);
        this.resetFields();
    }

    onSave(): void {
        // Never disabled: with something missing, saving shows every error instead
        if (!this.isSaveEnabled()) {
            showErrors(this.calendarEventForm);
            return;
        }
        this.visible = false;
        const event = this.createCalendarEvent();
        if (this.event) {
            this.calendarStore.updateCalendarEvent({event: event});
        } else {
            this.calendarStore.createCalendarEvent({event: event});
        }
        this.notify.emit(true);
    }

    onDelete(): void {
        this.visible = false;
        if (this.event) {
            this.deleteRequested.emit(this.event);
        }
    }

    isFieldInvalid(name: string): boolean {
        let control = this.calendarEventForm.get(name);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    isSaveEnabled(): boolean {
        return this.calendarEventForm.valid;
    }

    private createCalendarEvent(): CalendarEvent {
        const allDay = this.calendarEventForm.get('allDay')!.value;
        const start = new Date(this.calendarEventForm.get('startDateTime')!.value);
        const end = new Date(this.calendarEventForm.get('endDateTime')!.value);
        if (allDay) {
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
        }
        return {
            id: this.event?.id,
            name: this.calendarEventForm.get('name')!.value,
            description: this.calendarEventForm.get('description')?.value ?? undefined,
            startDateTime: toLocalDateTimeString(start),
            endDateTime: toLocalDateTimeString(end),
            allDay: allDay,
            clientId: this.calendarEventForm.controls.clientId.value ?? undefined,
            projectId: this.calendarEventForm.controls.projectId.value ?? undefined,
        };
    }

    private resetFields(): void {
        if (this.event) {
            this.calendarEventForm = this.formProvider.getCalendarEventFormGroup({
                name: this.event.name,
                description: this.event.description,
                startDateTime: toDateIfExists(this.event.startDateTime) ?? new Date(),
                endDateTime: toDateIfExists(this.event.endDateTime) ?? new Date(),
                allDay: this.event.allDay,
                clientId: this.event.clientId,
                projectId: this.event.projectId,
            });
        } else if (this.prefillSelection) {
            this.calendarEventForm = this.formProvider.getCalendarEventFormGroup({
                startDateTime: this.prefillSelection.date,
                endDateTime: this.prefillSelection.endDate ?? this.prefillSelection.date,
                allDay: this.prefillSelection.allDay,
            });
        } else {
            this.calendarEventForm = this.formProvider.getCalendarEventFormGroup({
                clientId: this.fixedClientId,
                projectId: this.fixedProjectId,
            });
            if (this.fixedClientId) {
                this.calendarEventForm.controls.clientId.disable();
            }
            if (this.fixedProjectId) {
                this.calendarEventForm.controls.projectId.disable();
            }
        }
        this.updateProjectOptions();
    }

    private updateProjectOptions(): void {
        const clientId = this.calendarEventForm.controls.clientId.value;
        this.projectOptions = clientId
            ? this.projects.filter(project => project.client?.id === clientId)
            : this.projects;
    }
}
