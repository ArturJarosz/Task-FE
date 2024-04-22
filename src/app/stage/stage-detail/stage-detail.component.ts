import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {FormGroup} from "@angular/forms";
import {StageDetailFormProvider, StageForm} from "./stage-detail-form-provider";
import {ConfigurationState, loadConfiguration} from "../../shared/configuration/state";
import {Store} from "@ngrx/store";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Stage} from "../../generated/models/stage";

@Component({
    selector: 'stage-detail',
    templateUrl: './stage-detail.component.html',
    styleUrls: ['./stage-detail.component.less']
})
export class StageDetailComponent implements OnInit {

    @Input()
    stage!: Stage | null;
    @Input()
    stageStatuses: ConfigurationEntry[] | null = [];
    @Input()
    stageTypes: ConfigurationEntry[] | null = [];
    @Output()
    refresh: EventEmitter<null> = new EventEmitter<null>();

    stageDetailsForm!: FormGroup<StageForm>;
    resolvedStatusLabel: string = '';
    resolvedTypeLabel: string = '';

    initialStageForm!: FormGroup<StageForm>;

    constructor(private formProvider: StageDetailFormProvider, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {

        this.configurationStore.dispatch(loadConfiguration());
        this.stageDetailsForm = this.formProvider.getStageDetailForm();
        console.log(`---  stage id: ${this.stage?.id}`)
        console.log(`---  stage name: ${this.stage?.name}`)
        this.fillFormData();
        this.resolveLabels();
    }

    private fillFormData() {
        if (!this.stage) {
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
        if (this.stageDetailsForm.get('status')?.value) {
            this.resolvedStatusLabel = resolveLabel(this.stageDetailsForm.get('status')?.value, this.stageStatuses)
        }
        if (this.stageDetailsForm.get('type')?.value) {
            this.resolvedTypeLabel = resolveLabel(this.stageDetailsForm.get('type')?.value, this.stageTypes)
        }
    }

}
