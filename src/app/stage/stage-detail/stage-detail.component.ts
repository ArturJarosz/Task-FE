import {Component, Input, OnInit} from '@angular/core';
import {Stage} from "../stage";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {FormGroup} from "@angular/forms";
import {StageDetailFormProvider, StageForm} from "./stage-detail-form-provider";
import {ConfigurationState, loadConfiguration} from "../../shared/configuration/state";
import {Store} from "@ngrx/store";

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

    stageDetailsForm!: FormGroup<StageForm>;
    resolvedStatusLabel: string = '';
    resolvedTypeLabel: string = '';

    initialStageForm!: FormGroup<StageForm>;


    constructor(private formProvider: StageDetailFormProvider, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.stageDetailsForm = this.formProvider.getStageDetailForm();
        this.fillFormData();
        this.resolveLabels();

    }

    private fillFormData() {
        if (this.stageDetailsForm === undefined) {
            return;
        }

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
        if (this.stageStatuses && this.stageStatuses.length > 0 && this.stageDetailsForm.get('status')?.value) {
            this.resolvedStatusLabel = this.resolveLabel(this.stageDetailsForm.get('status')?.value, this.stageStatuses)
        }
        if (this.stageTypes && this.stageTypes.length > 0 && this.stageDetailsForm.get('type')?.value) {
            this.resolvedTypeLabel = this.resolveLabel(this.stageDetailsForm.get('type')?.value, this.stageTypes)
        }
    }

    private resolveLabel(id: string | undefined, entries: ConfigurationEntry[]): string {
        if (!id) {
            return '';
        }
        let maybeLabel = entries.find(element => element.id === id)?.label;
        return maybeLabel ? maybeLabel : id;
    }
}
