import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {SupplierStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Supplier} from "../../generated/models/supplier";
import {SupplierDto} from "../model/supplier";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'app-supplier-list-shell',
    templateUrl: './supplier-list-shell.component.html',
    styleUrl: './supplier-list-shell.component.less'
})
export class SupplierListShellComponent implements OnInit {

    readonly supplierStore = inject(SupplierStore);
    readonly configurationStore = inject(ConfigurationStore);
    $supplierTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.supplierTypes;
    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers!;
    $suppliersNeedRefresh: Signal<boolean> = this.supplierStore.suppliersNeedRefresh!;

    constructor(private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$suppliersNeedRefresh()) {
                this.supplierStore.loadSuppliers({});
            }
        });
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.supplierStore.loadSuppliers({});
    }

    onDeleteSupplier($event: SupplierDto) {
        this.confirmationService.confirm({
            message: `Do you want to delete supplier ${$event.name}?`,
            header: `Confirm supplier delete ${$event.name}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.supplierStore.setSupplierId($event.id);
                this.supplierStore.deleteSupplier({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }
}
