import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {AddSupervisionVisitForm, AddSupervisionVisitFormProvider} from "./add-supervision-visit-form-provider";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {AbstractAddEditComponent} from "../../../shared";
import {SupervisionStore} from "../state/supervision.state";
import {toTimeZoneString} from "../../../shared/utils/date-utils";

@Component({
    selector: 'add-supervision-visit',
    templateUrl: './add-supervision-visit.component.html',
    styleUrl: './add-supervision-visit.component.less'
})
export class AddSupervisionVisitComponent implements OnInit, AbstractAddEditComponent {
    @Input()
    visible = false;
    @Input()
    supervisionId!: number;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add Supervision Visit";

    readonly supervisionStore = inject(SupervisionStore);

    addSupervisionVisitForm!: FormGroup<AddSupervisionVisitForm>;

    constructor(private formProvider: AddSupervisionVisitFormProvider) {
    }

    ngOnInit(): void {
        this.addSupervisionVisitForm = this.formProvider.getAddSupervisionVisitForm();
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onCancel(): void {
        this.resetFields();
        this.visible = false;
    }

    onSave(): void {
        this.visible = false;
        let supervisionVisit: SupervisionVisit = this.createSupervisionVisit();
        this.supervisionStore.createSupervisionVisit({supervisionVisit});
        this.resetFields();
    }

    isSaveEnabled(): boolean {
        return this.addSupervisionVisitForm.valid;
    }

    private resetFields(): void {
        this.addSupervisionVisitForm = this.formProvider.getAddSupervisionVisitForm();
    }

    private createSupervisionVisit(): SupervisionVisit {
        return {
            supervisionId: this.supervisionId,
            dateOfVisit: toTimeZoneString(this.addSupervisionVisitForm.value.dateOfVisit!),
            hoursCount: this.addSupervisionVisitForm.value.hoursCount,
            payable: this.addSupervisionVisitForm.value.payable
        };
    }
}
