import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {StageFormProvider, StageForm} from "../form/stage-form-provider";
import {ConfigurationState, loadConfiguration} from "../../shared/configuration/state";
import {Store} from "@ngrx/store";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

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
    refresh: EventEmitter<null> = new EventEmitter<null>();

    stageDetailsForm!: FormGroup<StageForm>;
    resolvedStatusLabel: string = '';
    resolvedTypeLabel: string = '';

    initialStageForm!: FormGroup<StageForm>;

    constructor(private formProvider: StageFormProvider, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.stageDetailsForm = this.formProvider.getStageDetailForm();
    }

    ngOnChanges({stage, stageStatuses, stageTypes}: SimpleChanges): void {
        if (this.stage && stage) {
            this.fillFormData();
            this.resolveLabels();
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
            deadline: this.stage.deadline ? new Date(this.stage.deadline) : undefined,
            startDate: this.stage.startDate ? new Date(this.stage.startDate) : undefined,
            endDate: this.stage.endDate ? new Date(this.stage.endDate) : undefined,
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

}
