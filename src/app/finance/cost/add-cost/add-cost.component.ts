import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AddCostFormProvider} from "./add-cost-form-provider";
import {Store} from "@ngrx/store";
import {CostState, createCost} from "../state";
import {ConfigurationState, getCostCategories, loadConfiguration} from "../../../shared/configuration/state";
import {ConfigurationEntry} from "../../../shared/configuration/model/configuration";
import {Subscription} from "rxjs";
import {FormGroup} from "@angular/forms";
import {Cost} from "../../../generated/models/cost";

@Component({
    selector: 'app-add-cost',
    templateUrl: './add-cost.component.html',
    styleUrl: './add-cost.component.less'
})
export class AddCostComponent implements OnInit, OnDestroy {
    @Input()
    visible = false;
    @Input()
    projectId!: number;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new cost";

    costCategoriesSubscription$!: Subscription;
    costCategories: ConfigurationEntry[] = [];
    addCostForm!: FormGroup;

    constructor(private addCostFormProvider: AddCostFormProvider, private costStore: Store<CostState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnDestroy(): void {
        this.costCategoriesSubscription$.unsubscribe();
    }

    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.costCategoriesSubscription$ = this.configurationStore.select(getCostCategories)
            .subscribe({
                next: categories => this.costCategories = categories
            })

        this.addCostForm = this.addCostFormProvider.getAddCostForm();
    }

    private initializeValues() {

    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
    }

    onCancel(): void {
        this.visible = false;
        this.resetFields();
    }

    onSave(): void {
        this.visible = false;
        let cost: Cost = this.createCost();
        this.costStore.dispatch(createCost({projectId: this.projectId, cost: cost}));
    }


    private createCost(): Cost {
        let cost: Cost;
        cost = {
            name: this.addCostForm.get('name')?.value,
            category: this.addCostForm.get('category')?.value,
            date: this.addCostForm.get('date')?.value,
            value: this.addCostForm.get('value')?.value,
            hasInvoice: this.addCostForm.get('hasInvoice')?.value,
            paid: this.addCostForm.get('paid')?.value,
            payable: true,
            note: this.addCostForm.get('note')?.value,
        };
        return cost;
    }

    isSaveEnabled(): boolean {
        return this.addCostForm.valid;
    }

    private resetFields(): void {
        this.addCostForm = this.addCostFormProvider.getAddCostForm();
    }
}
