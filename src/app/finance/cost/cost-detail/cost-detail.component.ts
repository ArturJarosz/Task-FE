import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {CostDetailFormProvider, CostForm} from "./cost-detail-form-provider";
import {resolveLabel} from "../../../shared/utils/label-utils";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {toDateIfExists} from "../../../shared/utils/date-utils";

@Component({
    selector: 'cost-detail',
    templateUrl: './cost-detail.component.html',
    styleUrl: './cost-detail.component.less'
})
export class CostDetailComponent implements OnInit, OnChanges {
    @Input()
    cost!: Cost | null;
    @Input()
    costCategories!: ConfigurationEntry[] | null;

    costDetailsForm!: FormGroup<CostForm>;
    resolvedCategoryLabel: string = '';

    constructor(private formProvider: CostDetailFormProvider) {
    }

    ngOnInit(): void {
        this.costDetailsForm = this.formProvider.getCostDetailForm();
    }

    ngOnChanges({cost, costCategories}: SimpleChanges): void {
        if (cost && this.cost) {
            this.fillFormData();
            this.resolveLabels();
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
            paid: this.cost.paid
        })
    }

    private resolveLabels() {
        if (this.costCategories && this.costCategories.length > 0 && this.costDetailsForm.get('category')?.value) {
            this.resolvedCategoryLabel = resolveLabel(this.costDetailsForm.get('category')?.value, this.costCategories);
        }
    }
}
