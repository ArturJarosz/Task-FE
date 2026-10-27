import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AddSupervisionVisitForm, AddSupervisionVisitFormProvider} from "./add-supervision-visit-form-provider";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {AbstractAddEditComponent} from "../../../shared";
import {SupervisionStore} from "../state/supervision.state";
import {toTimeZoneString} from "../../../shared/utils/date-utils";
import {isControlInvalid} from "../../../shared/utils/form-utils";
import {DialogModule} from "primeng/dialog";
import {DatePickerModule} from "primeng/datepicker";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-supervision-visit',
    templateUrl: './add-supervision-visit.component.html',
    styleUrl: './add-supervision-visit.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, DatePickerModule, InputNumberModule, ToggleSwitchModule, ButtonModule, ReactiveFormsModule]
})
export class AddSupervisionVisitComponent implements OnInit, AbstractAddEditComponent {
    @Input()
    visible = false;
    @Input()
    supervisionId!: number;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "New supervision visit";

    readonly supervisionStore = inject(SupervisionStore);

    addSupervisionVisitForm!: FormGroup<AddSupervisionVisitForm>;

    constructor(private formProvider: AddSupervisionVisitFormProvider) {
    }

    ngOnInit(): void {
        this.resetFields();
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
        this.supervisionStore.createSupervisionVisit({supervisionVisit: this.createSupervisionVisit()});
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.addSupervisionVisitForm, path);
    }

    isSaveEnabled(): boolean {
        return this.addSupervisionVisitForm.valid;
    }

    private resetFields(): void {
        this.addSupervisionVisitForm = this.formProvider.getAddSupervisionVisitForm();
    }

    private createSupervisionVisit(): SupervisionVisit {
        const value = this.addSupervisionVisitForm.getRawValue();
        return {
            supervisionId: this.supervisionId,
            dateOfVisit: toTimeZoneString(value.dateOfVisit!),
            hoursCount: value.hoursCount ?? 0,
            payable: value.payable
        };
    }
}
