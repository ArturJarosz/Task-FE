import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CalendarEventForm, CalendarEventFormProvider} from "../form/calendar-event-form-provider";
import {CalendarEvent} from "../../generated/models/calendar-event";
import {CalendarStore} from "../state";
import {EventSelection} from "../model/calendar.model";
import {toDateIfExists, toLocalDateTimeString} from "../../shared/utils/date-utils";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {DatePickerModule} from "primeng/datepicker";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-calendar-event',
    templateUrl: './add-calendar-event.component.html',
    styleUrl: './add-calendar-event.component.less',
    standalone: true,
    imports: [DialogModule, InputTextModule, Textarea, DatePickerModule, ToggleSwitchModule, ButtonModule, ReactiveFormsModule]
})
export class AddCalendarEventComponent implements OnChanges {
    @Input()
    visible = false;
    @Input()
    event: CalendarEvent | null = null;
    @Input()
    prefillSelection: EventSelection | null = null;

    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output()
    deleteRequested: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

    readonly calendarStore = inject(CalendarStore);

    calendarEventForm!: FormGroup<CalendarEventForm>;

    constructor(private formProvider: CalendarEventFormProvider) {
        this.calendarEventForm = this.formProvider.getCalendarEventFormGroup();
    }

    get header(): string {
        return this.event ? 'Edit event' : 'New event';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.resetFields();
        }
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
            });
        } else if (this.prefillSelection) {
            this.calendarEventForm = this.formProvider.getCalendarEventFormGroup({
                startDateTime: this.prefillSelection.date,
                endDateTime: this.prefillSelection.endDate ?? this.prefillSelection.date,
                allDay: this.prefillSelection.allDay,
            });
        } else {
            this.calendarEventForm = this.formProvider.getCalendarEventFormGroup();
        }
    }
}
