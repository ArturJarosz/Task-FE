import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {AddCostForm, AddCostFormProvider} from "./add-cost-form-provider";
import {CostStore} from "../state";
import {ConfigurationStore} from "../../../shared/configuration/state";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {toTimeZoneString} from "../../../shared/utils/date-utils";
import {isControlInvalid, isPaymentDateMissing} from "../../../shared/utils/form-utils";
import {AbstractAddEditComponent} from "../../../shared";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-cost',
    templateUrl: './add-cost.component.html',
    styleUrl: './add-cost.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class AddCostComponent implements OnInit, AbstractAddEditComponent {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    readonly costStore = inject(CostStore);
    readonly configurationStore = inject(ConfigurationStore);
    $costCategories: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.costCategories;

    addCostForm!: FormGroup<AddCostForm>;

    constructor(private addCostFormProvider: AddCostFormProvider) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.resetFields();
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
        this.costStore.createCost({cost: this.createCost()});
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.addCostForm, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.addCostForm);
    }

    isSaveEnabled(): boolean {
        return this.addCostForm.valid;
    }

    private createCost(): Cost {
        const value = this.addCostForm.getRawValue();
        return {
            name: value.name,
            categoryId: Number(value.category),
            date: toTimeZoneString(value.date),
            value: value.value ?? 0,
            hasInvoice: value.hasInvoice,
            paid: value.paid,
            // A payment date only makes sense once the cost is paid
            paymentDate: value.paid && value.paymentDate ? toTimeZoneString(value.paymentDate) : undefined,
            payable: true,
            note: value.note ?? undefined,
        };
    }

    private resetFields(): void {
        this.addCostForm = this.addCostFormProvider.getAddCostForm();
    }
}
