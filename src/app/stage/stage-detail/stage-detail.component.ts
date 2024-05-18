import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {StageForm, StageFormProvider} from "../form/stage-form-provider";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {toDateIfExists, toTimeZoneString} from "../../shared/utils/date-utils";
import {StageDto} from "../model/stage";
import {StageStatus} from "../../generated/models/stage-status";
import {cloneDeep} from "lodash";

@Component({
    selector: 'stage-detail',
    templateUrl: './stage-detail.component.html',
    styleUrls: ['./stage-detail.component.less']
})
export class StageDetailComponent implements OnInit, OnChanges {
    @Input()
    projectId: number = 0;
    @Input()
    stage!: Stage | null;
    @Input()
    stageStatuses!: ConfigurationEntry[] | null;
    @Input()
    stageTypes!: ConfigurationEntry[] | null;
    @Output()
    deleteStageEvent: EventEmitter<StageDto> = new EventEmitter<StageDto>();
    @Output()
    rejectEvent: EventEmitter<StageDto> = new EventEmitter<StageDto>();
    @Output()
    reopenEvent: EventEmitter<StageDto> = new EventEmitter<StageDto>();
    @Output()
    updateEvent: EventEmitter<Stage> = new EventEmitter<Stage>();

    stageDetailsForm!: FormGroup<StageForm>;
    resolvedStatusLabel: string = '';
    resolvedTypeLabel: string = '';
    canReopen: boolean = false;
    canReject: boolean = false;

    initialStageForm!: FormGroup<StageForm>;

    fieldsToUpdate: string[] = ["name", "type", "startDate", "endDate", "deadline", "note"];

    constructor(private formProvider: StageFormProvider) {
    }

    ngOnInit(): void {
        this.stageDetailsForm = this.formProvider.getStageDetailForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.stage && changes['stage']) {
            this.fillFormData();
            this.initialStageForm = cloneDeep(this.stageDetailsForm);
            this.resolveLabels();
            this.resolvedTypeLabel = resolveLabel(this.stage.type, this.stageTypes);
            this.canReject = this.stage.status !== StageStatus.REJECTED;
            this.canReopen = this.stage.status === StageStatus.REJECTED;
        }
    }

    private fillFormData(): void {
        if (!this.stage || this.stageDetailsForm === undefined) {
            return;
        }

        this.stageDetailsForm.patchValue({
            id: this.stage.id,
            type: this.stage.type,
            status: this.stage.status,
            name: this.stage.name,
            deadline: toDateIfExists(this.stage.deadline),
            startDate: toDateIfExists(this.stage.startDate),
            endDate: toDateIfExists(this.stage.endDate),
            note: this.stage.note
        })
    }

    private resolveLabels() {
        if (this.stage?.status) {
            this.resolvedStatusLabel = resolveLabel(this.stage.status, this.stageStatuses)
        }
        if (this.stage?.type) {
            this.resolvedTypeLabel = resolveLabel(this.stage.type, this.stageTypes)
        }
    }

    isUpdated(): boolean {
        return this.fieldsToUpdate.filter(fieldName => {
                return this.initialStageForm.get(fieldName)?.value !== this.stageDetailsForm.get(fieldName)?.value
            }
        ).length > 0;
    }

    onDelete(): void {
        this.deleteStageEvent.emit({stageName: this.stage!.name!, stageId: this.stage!.id!});
    }

    onReject(): void {
        this.rejectEvent.emit({stageName: this.stage!.name!, stageId: this.stage!.id!});
    }

    onReopen(): void {
        this.reopenEvent.emit({stageName: this.stage!.name!, stageId: this.stage!.id!});
    }

    onSave(): void {
        let stage: Stage;
        stage = {
            name: this.stageDetailsForm.value.name,
            type: this.stageDetailsForm.value.type,
            startDate: toTimeZoneString(this.stageDetailsForm.value.startDate),
            endDate: toTimeZoneString(this.stageDetailsForm.value.endDate),
            deadline: toTimeZoneString(this.stageDetailsForm.value.deadline),
            note: this.stageDetailsForm.value.note!
        }
        this.updateEvent.emit(stage);
    }
}
