import {Component, inject, OnInit, Signal} from '@angular/core';
import {ConfigurationStore} from "../../shared/configuration/state";
import {SupplierStore} from "../state";
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ActivatedRoute} from "@angular/router";

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

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let maybeSupplierId = this.route.snapshot.paramMap.get("supplierId");
        this.supplierId = Number(maybeSupplierId);
        this.supplierStore.setSupplierId(this.supplierId);

        this.supplierStore.loadSupplier({});
    }
}
