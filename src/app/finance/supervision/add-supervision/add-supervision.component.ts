import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AddSupervisionForm, AddSupervisionFormProvider} from "./add-supervision-form-provider";
import {Supervision} from "../../../generated/models/supervision";
import {AbstractAddEditComponent} from "../../../shared";
import {SupervisionStore} from "../state/supervision.state";
import {DialogModule} from "primeng/dialog";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-supervision',
    templateUrl: './add-supervision.component.html',
    styleUrl: './add-supervision.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, InputNumberModule, ToggleSwitchModule, ButtonModule, ReactiveFormsModule]
})
export class AddSupervisionComponent implements OnInit, AbstractAddEditComponent {
    @Input()
    visible = false;
    @Input()
    projectId!: number;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    readonly supervisionStore = inject(SupervisionStore);

    addSupervisionForm!: FormGroup<AddSupervisionForm>;

    constructor(private addSupervisionFormProvider: AddSupervisionFormProvider) {
    }

    ngOnInit(): void {
        this.resetFields();
        this.supervisionStore.setProjectId(this.projectId);
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onCancel(): void {
        this.visible = false;
        this.resetFields();
    }

    onSave(): void {
        this.visible = false;
        this.supervisionStore.createSupervision({supervision: this.createSupervision()});
    }

    isSaveEnabled(): boolean {
        return this.addSupervisionForm.valid;
    }

    private createSupervision(): Supervision {
        const value = this.addSupervisionForm.getRawValue();
        return {
            projectId: this.projectId,
            hasInvoice: value.hasInvoice,
            baseNetRate: value.baseNetValue ?? 0,
            visitNetRate: value.visitNetRate ?? 0,
            hourlyNetRate: value.hourlyNetRate ?? 0,
            visitCount: 0
        };
    }

    private resetFields(): void {
        this.addSupervisionForm = this.addSupervisionFormProvider.getAddSupervisionForm();
    }
}
