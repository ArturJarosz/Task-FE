import {Component, EventEmitter, effect, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {StageStore} from "../state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AddStageForm, StageFormProvider} from "../form/stage-form-provider";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {Installment} from "../../generated/models/installment";
import {ArchitectStore} from "../../architect/state/architect.state";
import {ProjectStore} from "../../project/state/project.state";
import {Architect} from "../../generated/models/architect";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {InputNumberModule} from "primeng/inputnumber";
import {ButtonModule} from "primeng/button";
import {NgIf, NgClass} from "@angular/common";

@Component({
    selector: 'add-stage',
    templateUrl: './add-stage.component.html',
    styleUrls: ['./add-stage.component.less'],
    standalone: true,
    imports: [DialogModule, SelectModule, DatePickerModule, InputTextModule, Textarea, ToggleSwitchModule, InputNumberModule, ButtonModule, ReactiveFormsModule, NgIf, NgClass]
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
    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);
    $stageTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageTypes;
    $architects: Signal<Architect[]> = this.architectStore.architects;

    addStageForm!: FormGroup<AddStageForm>;

    constructor(private formProvider: StageFormProvider) {
        effect(() => {
            const project = this.projectStore.project();
            if (project?.architect?.id && this.addStageForm) {
                this.addStageForm.patchValue({
                    architectId: project.architect.id
                });
            }
        });
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
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
            deadline: toTimeZoneString(this.addStageForm.get('deadline')!.value),
            architectId: this.addStageForm.get('architectId')?.value!
        };
        if (this.addStageForm.value.hasInstallment) {
            let installment: Installment;
            installment = {
                hasInvoice: this.addStageForm.value.hasInvoice!,
                value: this.addStageForm.value.installmentValue!,
                paid: this.addStageForm.value.paid!,
                paymentDate: this.addStageForm.value.paymentDate ? toTimeZoneString(this.addStageForm.value.paymentDate) : undefined
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
