import {Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {AddCostFormProvider} from "./add-cost-form-provider";
import {Store} from "@ngrx/store";
import {CostState, createCost} from "../state";
import {ConfigurationStore} from "../../../shared/configuration/state";
import {FormGroup} from "@angular/forms";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {toTimeZoneString} from "../../../shared/utils/date-utils";

@Component({
    selector: 'add-cost',
    templateUrl: './add-cost.component.html',
    styleUrl: './add-cost.component.less'
})
export class AddCostComponent implements OnInit {
    @Input()
    visible = false;
    @Input()
    projectId!: number;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new cost";

    configurationStore = inject(ConfigurationStore);
    $costCategories: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.costCategories;

    addCostForm!: FormGroup;

    constructor(private addCostFormProvider: AddCostFormProvider, private costStore: Store<CostState>) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.addCostForm = this.addCostFormProvider.getAddCostForm();
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
        let cost: Cost = this.createCost();
        this.costStore.dispatch(createCost({projectId: this.projectId, cost: cost}));
    }


    private createCost(): Cost {
        let cost: Cost;
        cost = {
            name: this.addCostForm.get('name')?.value,
            category: this.addCostForm.get('category')?.value,
            date: toTimeZoneString(this.addCostForm.get('date')?.value),
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
