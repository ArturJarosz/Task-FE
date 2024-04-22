import {Component, Input, OnInit} from '@angular/core';
import {ConfigurationEntry} from "../../../shared/configuration/model/configuration";
import {FormGroup} from "@angular/forms";
import {CostDetailFormProvider, CostForm} from "./cost-detail-form-provider";
import {ConfigurationState, loadConfiguration} from "../../../shared/configuration/state";
import {Store} from "@ngrx/store";
import {resolveLabel} from "../../../shared/utils/label-utils";
import {Cost} from "../../../generated/models/cost";

@Component({
    selector: 'cost-detail',
    templateUrl: './cost-detail.component.html',
    styleUrl: './cost-detail.component.less'
})
export class CostDetailComponent implements OnInit {
    @Input()
    cost!: Cost | null;
    @Input()
    costCategories: ConfigurationEntry[] | null = [];

    costDetailsForm!: FormGroup<CostForm>;
    resolvedCategoryLabel: string = '';

    constructor(private formProvider: CostDetailFormProvider, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.costDetailsForm = this.formProvider.getCostDetailForm();
        this.fillFormData();
        this.resolveLabels();
    }

    private fillFormData() {
        if (!this.cost) {
            return;
        }

        this.costDetailsForm.patchValue({
            id: this.cost.id,
            name: this.cost.name,
            date: new Date(this.cost.date),
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
