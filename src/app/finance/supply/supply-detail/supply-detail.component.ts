import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Supply} from "../../../generated/models/supply";
import {Supplier} from "../../../generated/models/supplier";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SupplyDetailForm, SupplyFormProvider} from "../form";
import {cloneDeep} from "lodash";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";
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
    selector: 'supply-detail',
    templateUrl: './supply-detail.component.html',
    styleUrl: './supply-detail.component.less',
    standalone: true,
    imports: [WrapperComponent, Accordion, AccordionPanel, AccordionHeader, AccordionContent, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class SupplyDetailComponent implements OnInit, OnChanges {
    @Input()
    supply!: Supply | null;

    @Input()
    suppliers: Supplier[] = [];

    @Output()
    updateSupplyEvent: EventEmitter<Supply> = new EventEmitter<Supply>();

    @Output()
    deleteSupplyEvent: EventEmitter<{ supplyId: number, supplyName: string }> = new EventEmitter<{ supplyId: number, supplyName: string }>();

    initialSupplyDetailForm!: FormGroup<SupplyDetailForm>;
    supplyDetailForm!: FormGroup<SupplyDetailForm>;

    constructor(private supplyFormProvider: SupplyFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.supply && this.supplyDetailForm) {
            this.fillFormData();
            this.initialSupplyDetailForm = cloneDeep(this.supplyDetailForm);
        }
    }

    ngOnInit(): void {
        this.supplyDetailForm = this.supplyFormProvider.getSupplyDetailForm();
        this.fillFormData();
        this.initialSupplyDetailForm = cloneDeep(this.supplyDetailForm);
        this.supplyDetailForm.valueChanges.subscribe(() => {
            if (this.supplyDetailForm.value.paid && this.supplyDetailForm.controls.paymentDate.disabled) {
                this.supplyDetailForm.controls.paymentDate.enable();
            } else if (!this.supplyDetailForm.value.paid && this.supplyDetailForm.controls.paymentDate.enabled) {
                this.supplyDetailForm.controls.paymentDate.disable();
            }
        });
    }

    private fillFormData(): void {
        if (!this.supply) {
            return;
        }
        this.supplyDetailForm.patchValue({
            name: this.supply.name,
            value: this.supply.value,
            hasInvoice: this.supply.hasInvoice,
            paid: this.supply.paid,
            paymentDate: toDateIfExists(this.supply.paymentDate),
            note: this.supply.note,
            supplierId: this.supply.supplierId
        })
        if (this.supply.paid) {
            this.supplyDetailForm.controls.paymentDate.enable();
        } else {
            this.supplyDetailForm.controls.paymentDate.disable();
        }
    }

    isFormChanged(): boolean {
        if (!this.supplyDetailForm || !this.initialSupplyDetailForm) {
            return false;
        }
        if (this.supplyDetailForm.pristine) {
            return false;
        }
        return JSON.stringify(this.initialSupplyDetailForm.value) !== JSON.stringify(this.supplyDetailForm.value);
    }

    onSave(): void {
        let supply: Supply = {
            id: this.supply?.id,
            projectId: this.supply?.projectId,
            name: this.supplyDetailForm.value.name,
            value: this.supplyDetailForm.value.value,
            hasInvoice: this.supplyDetailForm.value.hasInvoice,
            paid: this.supplyDetailForm.value.paid,
            paymentDate: this.supplyDetailForm.value.paid ? toTimeZoneString(this.supplyDetailForm.controls.paymentDate.value!) : undefined,
            note: this.supplyDetailForm.value.note,
            supplierId: this.supplyDetailForm.value.supplierId,
            payable: this.supply?.payable
        };
        this.updateSupplyEvent.emit(supply);
    }

    onDelete(): void {
        if (this.supply?.id && this.supply?.name) {
            this.deleteSupplyEvent.emit({
                supplyId: this.supply.id,
                supplyName: this.supply.name
            });
        }
    }
}
