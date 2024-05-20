import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ConfigurationStore} from "../../shared/configuration/state";
import {SupplierStore} from "../state";
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ActivatedRoute, Router} from "@angular/router";
import {SupplierDto} from "../model/supplier";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'supplier-detail-shell',
    templateUrl: './supplier-detail-shell.component.html',
    styleUrl: './supplier-detail-shell.component.less'
})
export class SupplierDetailShellComponent implements OnInit {
    supplierId!: number;

    readonly supplierStore = inject(SupplierStore);
    readonly configurationStore = inject(ConfigurationStore);
    $supplier: Signal<Supplier | null> = this.supplierStore.supplier;
    $supplierTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.supplierTypes;
    $supplierNeedsRefresh: Signal<boolean> = this.supplierStore.supplierNeedsRefresh!;

    constructor(private route: ActivatedRoute, private confirmationService: ConfirmationService,
                private router: Router) {
        effect(() => {
            if(this.$supplierNeedsRefresh()) {
                this.supplierStore.loadSupplier({});
            }
        });
    }

    ngOnInit(): void {
        let maybeSupplierId = this.route.snapshot.paramMap.get("supplierId");
        this.supplierId = Number(maybeSupplierId);
        this.supplierStore.setSupplierId(this.supplierId);

        this.supplierStore.loadSupplier({});
    }

    onUpdateSupplier($event: Supplier) {
        this.supplierStore.updateSupplier({supplier: $event});
    }

    onDeleteSupplier($event: SupplierDto) {
        this.confirmationService.confirm({
            message: `Do you want to delete supplier ${$event.name}?`,
            header: `Confirm deleting supplier ${$event.name}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.supplierStore.setSupplierId($event.id);
                this.supplierStore.deleteSupplier({});
                this.router.navigate([`/suppliers`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }
}
