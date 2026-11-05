import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe} from "@angular/common";
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
import {StageForm, StageFormProvider} from "../form/stage-form-provider";
import {StageDto} from "../model/stage";
import {Architect, ConfigurationEntry, Stage, StageStatus} from "../../generated/models";
import {
    DurationPipe,
    EmptyStateComponent,
    FieldComponent,
    KpiCardComponent,
    LoadErrorComponent,
    PageCrumb,
    PageHeaderComponent
} from "../../shared";
import {initials, resolveKnownLabel, resolveLabel} from "../../shared/utils/label-utils";
import {statusSeverity} from "../../shared/status-severity";
import {toDateIfExists, toTimeZoneString} from "../../shared/utils/date-utils";
import {changedFields, showErrors} from "../../shared/utils/form-utils";
import {TaskListShellComponent} from "../../task/task-list-shell/task-list-shell.component";

type StageFormValue = ReturnType<FormGroup<StageForm>['getRawValue']>;

const EDITABLE_FIELDS: (keyof StageFormValue)[] = ['name', 'type', 'startDate', 'endDate', 'deadline', 'note', 'architectId'];

export interface ArchitectOption {
    id: number;
    name: string;
}

@Component({
    selector: 'stage-detail',
    templateUrl: './stage-detail.component.html',
    styleUrls: ['./stage-detail.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, FieldComponent, EmptyStateComponent, KpiCardComponent, LoadErrorComponent, TaskListShellComponent,
        ButtonModule, DatePickerModule, DialogModule, InputTextModule, MenuModule, SelectModule, SkeletonModule, TagModule,
        Textarea, TooltipModule, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, DurationPipe]
})
export class StageDetailComponent implements OnChanges {
    @Input()
    projectId: number = 0;
    @Input()
    projectName: string = '';
    @Input()
    stage!: Stage | null;
    @Input()
    loadFailed: boolean = false;
    @Input()
    stageStatuses!: ConfigurationEntry[] | null;
    @Input()
    stageTypes!: ConfigurationEntry[] | null;
    @Input()
    architects!: Architect[] | null;
    @Output()
    deleteStageEvent: EventEmitter<StageDto> = new EventEmitter<StageDto>();
    @Output()
    rejectEvent: EventEmitter<StageDto> = new EventEmitter<StageDto>();
    @Output()
    reopenEvent: EventEmitter<StageDto> = new EventEmitter<StageDto>();
    @Output()
    updateEvent: EventEmitter<Stage> = new EventEmitter<Stage>();
    @Output()
    reloadEvent: EventEmitter<void> = new EventEmitter<void>();

    protected readonly statusSeverity = statusSeverity;


    stageDetailsForm: FormGroup<StageForm>;
    private initialValue!: StageFormValue;
    showEditDialog = false;

    crumbs: PageCrumb[] = [];
    actions: MenuItem[] = [];
    architectOptions: ArchitectOption[] = [];
    resolvedStatusLabel = '';
    resolvedTypeLabel = '';
    architectName = '';
    // Tasks of the stage with time logged on them
    timedTaskCount = 0;

    constructor(private formProvider: StageFormProvider) {
        this.stageDetailsForm = this.formProvider.getStageDetailForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['architects']) {
            this.architectOptions = (this.architects ?? []).map(architect =>
                ({id: architect.id!, name: `${architect.firstName} ${architect.lastName}`}));
        }
        if (changes['stage'] && this.stage) {
            this.resetForm();
            this.actions = this.buildActions();
        }
        if (changes['stage']) {
            this.timedTaskCount = (this.stage?.tasks ?? []).filter(task => (task.timeSpentMinutes ?? 0) > 0).length;
        }
        if (this.stage) {
            this.resolvedStatusLabel = resolveLabel(this.stage.status, this.stageStatuses);
            this.resolvedTypeLabel = resolveKnownLabel(this.stage.typeId, this.stageTypes);
            this.architectName = this.architectOptions.find(option => option.id === this.stage?.architectId)?.name ?? '';
        }
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Projects', route: ['/projects']},
            {label: this.projectName || 'Project', route: ['/projects', this.projectId]},
            {label: 'Stages', route: ['/projects', this.projectId, 'stages']},
            {label: this.stage?.name ?? 'Stage'},
        ];
    }

    get architectInitials(): string {
        return initials(this.architectName);
    }

    get timedTaskCountLabel(): string {
        return this.timedTaskCount === 1 ? 'on 1 task' : `on ${this.timedTaskCount} tasks`;
    }

    get isUpdated(): boolean {
        return changedFields(this.initialValue, this.stageDetailsForm.getRawValue(), EDITABLE_FIELDS).length > 0;
    }

    isFieldInvalid(path: string): boolean {
        const control = this.stageDetailsForm.get(path);
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
        if (showErrors(this.stageDetailsForm)) {
            return;
        }
        const value = this.stageDetailsForm.getRawValue();
        this.updateEvent.emit({
            name: value.name,
            typeId: Number(value.type),
            startDate: toTimeZoneString(value.startDate ?? undefined),
            endDate: toTimeZoneString(value.endDate ?? undefined),
            deadline: toTimeZoneString(value.deadline ?? undefined),
            note: value.note ?? undefined,
            architectId: value.architectId ?? undefined
        });
        this.showEditDialog = false;
    }

    private resetForm(): void {
        if (!this.stage) {
            return;
        }
        this.stageDetailsForm.reset({
            id: this.stage.id,
            name: this.stage.name,
            type: this.stage.typeId != null ? String(this.stage.typeId) : '',
            status: this.stage.status,
            startDate: toDateIfExists(this.stage.startDate) ?? null,
            deadline: toDateIfExists(this.stage.deadline) ?? null,
            endDate: toDateIfExists(this.stage.endDate) ?? null,
            note: this.stage.note ?? null,
            architectId: this.stage.architectId ?? null
        });
        this.initialValue = this.stageDetailsForm.getRawValue();
    }

    private buildActions(): MenuItem[] {
        const stageDto: StageDto = {stageName: this.stage!.name!, stageId: this.stage!.id!};
        const statusAction: MenuItem = this.stage!.status === StageStatus.REJECTED
            ? {label: 'Reopen stage', icon: 'pi pi-replay', command: () => this.reopenEvent.emit(stageDto)}
            : {label: 'Reject stage', icon: 'pi pi-ban', command: () => this.rejectEvent.emit(stageDto)};
        return [
            statusAction,
            {separator: true},
            {label: 'Delete stage', icon: 'pi pi-trash', command: () => this.deleteStageEvent.emit(stageDto)},
        ];
    }
}
