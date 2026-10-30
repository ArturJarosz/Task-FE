import {ChangeDetectionStrategy, Component, computed, effect, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
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
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {InputNumberModule} from "primeng/inputnumber";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-stage',
    templateUrl: './add-stage.component.html',
    styleUrls: ['./add-stage.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, DatePickerModule, InputTextModule, Textarea, ToggleSwitchModule, InputNumberModule, ButtonModule, ReactiveFormsModule]
})
export class AddStageComponent implements OnInit {
    @Input()
    visible = false;
    @Input()
    projectId!: number;

    @Output()
    addStageNotify: EventEmitter<boolean> = new EventEmitter<boolean>();

    readonly stageStore = inject(StageStore);
    readonly configurationStore = inject(ConfigurationStore);
    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);
    $stageTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageTypes;
    $architectOptions = computed(() => this.architectStore.architects()
        .map(architect => ({id: architect.id!, name: `${architect.firstName} ${architect.lastName}`})));

    addStageForm!: FormGroup<AddStageForm>;

    constructor(private formProvider: StageFormProvider) {
        effect(() => {
            this.projectStore.project();
            this.prefillArchitect();
        });
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
        this.resetFields();
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
        this.stageStore.createStage({projectId: this.projectId, stage: this.createStage()});
    }

    markAsDirty(path: string): void {
        this.addStageForm.get(path)?.markAsDirty();
    }

    isFieldInvalid(path: string): boolean {
        const control = this.addStageForm.get(path);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    isInstallmentValueInvalid(): boolean {
        const control = this.addStageForm.get('installmentValue');
        return !!control && (control.touched || control.dirty) && !((control.value ?? 0) > 0);
    }

    isSaveEnabled(): boolean {
        const value = this.addStageForm.getRawValue();
        return this.addStageForm.valid && (!value.hasInstallment || (value.installmentValue ?? 0) > 0);
    }

    private createStage(): Stage {
        const value = this.addStageForm.getRawValue();
        const stage: Stage = {
            name: value.name,
            type: value.type,
            note: value.note ?? undefined,
            deadline: toTimeZoneString(value.deadline ?? undefined),
            architectId: value.architectId ?? undefined
        };
        if (value.hasInstallment) {
            const installment: Installment = {
                hasInvoice: value.hasInvoice ?? false,
                value: value.installmentValue ?? 0,
                paid: value.paid ?? false,
                // A payment date only makes sense once the installment is paid
                paymentDate: value.paid && value.paymentDate ? toTimeZoneString(value.paymentDate) : undefined
            };
            stage.installment = installment;
        }
        return stage;
    }

    private resetFields(): void {
        this.addStageForm = this.formProvider.getAddStageForm();
        this.prefillArchitect();
    }

    private prefillArchitect(): void {
        const architectId = this.projectStore.project()?.architect?.id;
        if (architectId && this.addStageForm) {
            this.addStageForm.patchValue({architectId});
        }
    }
}
