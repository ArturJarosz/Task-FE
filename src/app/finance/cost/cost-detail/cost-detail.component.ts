import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CostDetailFormProvider, CostForm} from "./cost-detail-form-provider";
import {resolveLabel} from "../../../shared/utils/label-utils";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";
import {cloneDeep} from "lodash";
import {WrapperComponent} from "../../../shared/wrapper/wrapper.component";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'cost-detail',
    templateUrl: './cost-detail.component.html',
    styleUrl: './cost-detail.component.less',
    standalone: true,
    imports: [WrapperComponent, Accordion, AccordionPanel, AccordionHeader, AccordionContent, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class CostDetailComponent implements OnInit, OnChanges {
    @Input()
    cost!: Cost | null;
    @Input()
    costCategories!: ConfigurationEntry[] | null;
    @Output()
    updateCostEvent: EventEmitter<Cost> = new EventEmitter<Cost>();

    costDetailsForm!: FormGroup<CostForm>;
    initialCostDetailsForm!: FormGroup<CostForm>;

    resolvedCategoryLabel: string = '';

    constructor(private formProvider: CostDetailFormProvider) {
    }

    ngOnInit(): void {
        this.costDetailsForm = this.formProvider.getCostDetailForm();
        this.fillFormData();
        this.initialCostDetailsForm = cloneDeep(this.costDetailsForm);
        this.costDetailsForm.valueChanges.subscribe(() => {
            if (this.costDetailsForm.value.paid && this.costDetailsForm.controls.paymentDate.disabled) {
                this.costDetailsForm.controls.paymentDate.enable();
            } else if (!this.costDetailsForm.value.paid && this.costDetailsForm.controls.paymentDate.enabled) {
                this.costDetailsForm.controls.paymentDate.disable();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.cost && this.costDetailsForm) {
            this.fillFormData();
            this.initialCostDetailsForm = cloneDeep(this.costDetailsForm);
        }
    }

    private fillFormData() {
        if (!this.cost) {
            return;
        }

        this.costDetailsForm.patchValue({
            id: this.cost.id,
            name: this.cost.name,
            date: toDateIfExists(this.cost.date),
            category: this.cost.category,
            value: this.cost.value,
            note: this.cost.note,
            hasInvoice: this.cost.hasInvoice,
            paid: this.cost.paid,
            paymentDate: toDateIfExists(this.cost.paymentDate)
        })
        if (this.cost.paid) {
            this.costDetailsForm.controls.paymentDate.enable();
        } else {
            this.costDetailsForm.controls.paymentDate.disable();
        }
    }

    private resolveLabels() {
        if (this.costCategories && this.costCategories.length > 0 && this.costDetailsForm.get('category')?.value) {
            this.resolvedCategoryLabel = resolveLabel(this.costDetailsForm.get('category')?.value, this.costCategories);
        }
    }

    isFormChanged(): boolean {
        if (this.costDetailsForm.pristine) {
            return false;
        }
        return JSON.stringify(this.initialCostDetailsForm.value) !== JSON.stringify(this.costDetailsForm.value);
    }

    onSave(): void {
        let costToUpdate: Cost;
        costToUpdate = {
            name: this.costDetailsForm.value.name,
            category: this.costDetailsForm.value.category,
            note: this.costDetailsForm.value.note!,
            paid: this.costDetailsForm.value.paid,
            value: this.costDetailsForm.value.value,
            payable: true,
            hasInvoice: this.costDetailsForm.value.hasInvoice,
            date: toTimeZoneString(this.costDetailsForm.value.date),
            paymentDate: this.costDetailsForm.value.paid ? toTimeZoneString(this.costDetailsForm.controls.paymentDate.value!) : undefined
        }
        this.updateCostEvent.emit(costToUpdate);
    }
}
