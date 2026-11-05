import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {DatePickerModule} from "primeng/datepicker";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {MenuModule} from "primeng/menu";
import {SelectModule} from "primeng/select";
import {SkeletonModule} from "primeng/skeleton";
import {TagModule} from "primeng/tag";
import {Textarea} from "primeng/textarea";
import {TooltipModule} from "primeng/tooltip";
import {Architect, ConfigurationEntry, Task, TaskStatus, TimeEntry} from "../../generated/models";
import {TaskForm, TaskFormProvider} from "../form/task-form-provider";
import {DeleteTaskDto, UpdateTaskDto} from "../model/task";
import {EmptyStateComponent, FieldComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent} from "../../shared";
import {initials, resolveKnownLabel, resolveLabel} from "../../shared/utils/label-utils";
import {statusSeverity} from "../../shared/status-severity";
import {toDateIfExists, toTimeZoneString} from "../../shared/utils/date-utils";
import {changedFields, showErrors} from "../../shared/utils/form-utils";
import {QuickLog, TaskTimeCardComponent} from "../../time-entry/task-time-card/task-time-card.component";

type TaskFormValue = ReturnType<FormGroup<TaskForm>['getRawValue']>;

// Status goes through its own endpoint, so it is compared separately from the other fields
const DATA_FIELDS: (keyof TaskFormValue)[] = ['name', 'type', 'startDate', 'endDate', 'note', 'architectId'];

@Component({
    selector: 'task-detail',
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, PageHeaderComponent, FieldComponent, EmptyStateComponent,
        TaskTimeCardComponent, ButtonModule, DatePickerModule, DialogModule, InputTextModule, MenuModule, SelectModule,
        SkeletonModule, TagModule, Textarea, TooltipModule, ReactiveFormsModule, RouterLink, DatePipe]
})
export class TaskDetailComponent implements OnChanges {
    @Input()
    task!: Task | null;
    @Input()
    loadFailed: boolean = false;
    @Input()
    taskTypes!: ConfigurationEntry[] | null;
    @Input()
    taskStatuses!: ConfigurationEntry[] | null;
    @Input()
    architects!: Architect[] | null;
    @Input()
    projectId: number = 0;
    @Input()
    projectName: string = '';
    @Input()
    stageId: number = 0;
    @Input()
    stageName: string = '';
    @Input()
    timeEntries: TimeEntry[] = [];
    @Input()
    timeEntriesLoading: boolean = false;
    @Input()
    timeEntriesLoadFailed: boolean = false;
    @Input()
    timeEntrySaving: boolean = false;
    // Who time typed in the Time spent card is logged for
    @Input()
    logArchitectId: number | undefined;
    @Output()
    reloadEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    updateStatusEvent: EventEmitter<UpdateTaskDto> = new EventEmitter<UpdateTaskDto>();
    @Output()
    deleteTaskEVent: EventEmitter<DeleteTaskDto> = new EventEmitter<DeleteTaskDto>();
    @Output()
    logTimeEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    quickLogEvent: EventEmitter<QuickLog> = new EventEmitter<QuickLog>();
    @Output()
    showTimeEntriesEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    reloadTimeEntriesEvent: EventEmitter<void> = new EventEmitter<void>();

    protected readonly statusSeverity = statusSeverity;

    taskDetailForm: FormGroup<TaskForm>;
    private initialValue!: TaskFormValue;
    showEditDialog = false;

    crumbs: PageCrumb[] = [];
    actions: MenuItem[] = [];
    availableTaskStatuses: ConfigurationEntry[] = [];
    architectOptions: { id: number, name: string }[] = [];
    resolvedTypeLabel = '';
    resolvedStatusLabel = '';
    architectName = '';

    constructor(private formProvider: TaskFormProvider) {
        this.taskDetailForm = this.formProvider.getTaskDetailForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['architects']) {
            this.architectOptions = (this.architects ?? []).map(architect =>
                ({id: architect.id!, name: `${architect.firstName} ${architect.lastName}`}));
        }
        if (changes['task'] && this.task) {
            this.resetForm();
            this.actions = [
                {label: 'Log time', icon: 'pi pi-clock', command: () => this.logTimeEvent.emit()},
                {separator: true},
                {label: 'Delete task', icon: 'pi pi-trash',
                    command: () => this.deleteTaskEVent.emit({taskName: this.task!.name!, taskId: this.task!.id!})}
            ];
        }
        if (this.task) {
            this.resolvedTypeLabel = resolveKnownLabel(this.task.typeId, this.taskTypes);
            this.resolvedStatusLabel = resolveLabel(this.task.status, this.taskStatuses);
            this.architectName = this.architectOptions.find(option => option.id === this.task?.architectId)?.name ?? '';
            this.resolveAvailableStatuses();
        }
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Projects', route: ['/projects']},
            {label: this.projectName || 'Project', route: ['/projects', this.projectId]},
            {label: this.stageName || 'Stage', route: ['/projects', this.projectId, 'stages', this.stageId]},
            {label: this.task?.name ?? 'Task'},
        ];
    }

    get architectInitials(): string {
        return initials(this.architectName);
    }

    get statusNeedsUpdate(): boolean {
        return changedFields(this.initialValue, this.taskDetailForm.getRawValue(), ['status']).length > 0;
    }

    get dataNeedsUpdate(): boolean {
        return changedFields(this.initialValue, this.taskDetailForm.getRawValue(), DATA_FIELDS).length > 0;
    }

    isFieldInvalid(path: string): boolean {
        const control = this.taskDetailForm.get(path);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    onEdit(): void {
        this.resetForm();
        this.showEditDialog = true;
    }

    onCancelEdit(): void {
        this.showEditDialog = false;
        this.resetForm();
    }

    onSave(): void {
        // Disabled only while nothing changed: with something missing, saving shows every error instead
        if (showErrors(this.taskDetailForm)) {
            return;
        }
        const value = this.taskDetailForm.getRawValue();
        this.updateStatusEvent.emit({
            task: {
                status: value.status,
                name: value.name,
                startDate: toTimeZoneString(value.startDate ?? undefined),
                endDate: toTimeZoneString(value.endDate ?? undefined),
                typeId: Number(value.type),
                note: value.note ?? undefined,
                architectId: value.architectId ?? undefined,
            },
            updateStatus: this.statusNeedsUpdate,
            updateData: this.dataNeedsUpdate,
        });
        this.showEditDialog = false;
    }

    private resetForm(): void {
        if (!this.task) {
            return;
        }
        this.taskDetailForm.reset({
            id: this.task.id,
            name: this.task.name,
            startDate: toDateIfExists(this.task.startDate) ?? null,
            endDate: toDateIfExists(this.task.endDate) ?? null,
            status: this.task.status,
            type: this.task.typeId != null ? String(this.task.typeId) : '',
            note: this.task.note ?? null,
            architectId: this.task.architectId ?? null
        });
        this.initialValue = this.taskDetailForm.getRawValue();
    }

    // The current status plus the ones the backend allows next
    private resolveAvailableStatuses(): void {
        const statuses = this.taskStatuses ?? [];
        const next = this.task?.nextStatuses ?? [];
        this.availableTaskStatuses = statuses.filter(status =>
            status.id === this.task?.status || next.includes(status.id as TaskStatus));
    }
}
