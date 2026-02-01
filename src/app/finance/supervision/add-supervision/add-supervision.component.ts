import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {AddSupervisionForm, AddSupervisionFormProvider} from "./add-supervision-form-provider";
import {Supervision} from "../../../generated/models/supervision";
import {AbstractAddEditComponent} from "../../../shared";
import {SupervisionStore} from "../state/supervision.state";

@Component({
    selector: 'add-supervision',
    templateUrl: './add-supervision.component.html',
    styleUrl: './add-supervision.component.less'
})
export class AddSupervisionComponent implements OnInit, AbstractAddEditComponent{
    @Input()
    visible = false;
    @Input()
    projectId!: number;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new Supervision";

    readonly supervisionStore = inject(SupervisionStore);

    addSupervisionForm!: FormGroup<AddSupervisionForm>;

    constructor(private addSupervisionFormProvider: AddSupervisionFormProvider) {
    }

    ngOnInit(): void {
        this.addSupervisionForm = this.addSupervisionFormProvider.getAddSupervisionForm();
        this.supervisionStore.setProjectId(this.projectId);
    }

    onClose(): void {
        this.notify.emit(false);
        this.visible = false;
    }

    onCancel(): void {
        this.visible = false;
    }

    onSave(): void {
        this.visible = false;
        let supervision: Supervision = this.createSupervision();
        this.supervisionStore.createSupervision({supervision: supervision});
    }

    private createSupervision(): Supervision {
        let supervision: Supervision = {};

        // add rest
        supervision = {
            projectId: this.projectId,
            hasInvoice: this.addSupervisionForm.get('hasInvoice')?.value,
            baseNetRate: this.addSupervisionForm.get('baseNetValue')?.value,
            visitNetRate: this.addSupervisionForm.get('visitNetRate')?.value,
            hourlyNetRate: this.addSupervisionForm.get('hourlyNetRate')?.value,
            visitCount: 0
        }

        return supervision;
    }

    isSaveEnabled(): boolean {
        return this.addSupervisionForm.valid;
    }

    private resetFields(): void {
        this.addSupervisionForm = this.addSupervisionFormProvider.getAddSupervisionForm();
    }
}
