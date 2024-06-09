import {Component, EventEmitter, inject, Input, OnInit, Output, Signal, ViewEncapsulation} from '@angular/core';
import {StageStore} from "../state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {AddStageForm, StageFormProvider} from "../form/stage-form-provider";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {Installment} from "../../generated/models/installment";

@Component({
    selector: 'add-stage',
    templateUrl: './add-stage.component.html',
    styleUrls: ['./add-stage.component.less']
})
export class AddStageComponent implements OnInit {
    @Input()
    visible = false;
    @Input()
    projectId!: number;

    @Output()
    addStageNotify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new stage";

    readonly stageStore = inject(StageStore);
    readonly configurationStore = inject(ConfigurationStore);
    $stageTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageTypes;

    addStageForm!: FormGroup<AddStageForm>;

    constructor(private formProvider: StageFormProvider) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.addStageForm = this.formProvider.getAddStageForm();
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
        if (this.addStageForm.value.hasInstallment) {
            let installment: Installment;
            installment = {
                hasInvoice: this.addStageForm.value.hasInvoice!,
                value: this.addStageForm.value.installmentValue!
            };
            stage.installment = installment;
        }
        return stage;
    }

    isSaveEnabled(): boolean {
        return this.addStageForm.valid;
    }

    private resetFields(): void {
        this.addStageForm = this.formProvider.getAddStageForm();
    }

}
