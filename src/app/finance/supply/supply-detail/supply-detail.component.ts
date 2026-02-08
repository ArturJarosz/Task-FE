import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Supply} from "../../../generated/models/supply";
import {Supplier} from "../../../generated/models/supplier";
import {FormGroup} from '@angular/forms';
import {SupplyDetailForm, SupplyFormProvider} from "../form";
import {cloneDeep} from "lodash";

@Component({
    selector: 'supply-detail',
    templateUrl: './supply-detail.component.html',
    styleUrl: './supply-detail.component.less'
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
            note: this.supply.note,
            supplierId: this.supply.supplierId
        })
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
