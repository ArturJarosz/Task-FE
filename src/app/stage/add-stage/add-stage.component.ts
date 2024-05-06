import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {StageStore} from "../state";
import {Subscription} from "rxjs";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {AddStageForm, StageFormProvider} from "../form/stage-form-provider";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getStageStatusConfiguration,
    getStageTypeConfiguration,
    loadConfiguration
} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {toTimeZoneString} from "../../shared/utils/date-utils";

@Component({
    selector: 'add-stage',
    templateUrl: './add-stage.component.html',
    styleUrl: './add-stage.component.less'
})
export class AddStageComponent implements OnInit, OnDestroy {
    @Input()
    visible = false;
    @Input()
    projectId!: number;

    @Output()
    addStageNotify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new stage";

    readonly stageStore = inject(StageStore);

    stageTypesSubscription!: Subscription;
    stageTypes!: ConfigurationEntry[];
    stageStatusesSubscription!: Subscription;
    stageStatuses!: ConfigurationEntry[];
    addStageForm!: FormGroup<AddStageForm>;

    constructor(private configurationStore: Store<ConfigurationState>, private formProvider: StageFormProvider) {

    }

    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.stageStatusesSubscription = this.configurationStore.select(getStageStatusConfiguration)
            .subscribe({
                next: statuses => this.stageStatuses = statuses
            })
        this.stageTypesSubscription = this.configurationStore.select(getStageTypeConfiguration)
            .subscribe({
                next: types => this.stageTypes = types
            })
        this.addStageForm = this.formProvider.getAddStageForm();
    }

    ngOnDestroy(): void {
        this.stageTypesSubscription.unsubscribe();
        this.stageStatusesSubscription.unsubscribe();
    }

    onClose(): void {
        this.resetFields();
        this.addStageNotify.emit(false);
        this.visible = false;
    }

    onCancel(): void {
        this.visible = false;
        this.resetFields();
    }

    onSave(): void {
        this.visible = false;
        let stage = this.createStage();
        this.stageStore.createStage({projectId: this.projectId, stage: stage})
    }

    private createStage(): Stage {
        let stage: Stage;
        stage = {
            name: this.addStageForm.get('name')!.value,
            type: this.addStageForm.get('type')!.value,
            note: this.addStageForm.get('note')?.value!,
            deadline: toTimeZoneString(this.addStageForm.get('deadline')!.value)
        };
        return stage;
    }

    isSaveEnabled(): boolean {
        return this.addStageForm.valid;
    }

    private resetFields(): void {
        this.addStageForm = this.formProvider.getAddStageForm();
    }

}
