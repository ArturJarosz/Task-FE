import {Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {SupplierDto} from "../model/supplier";
import {WrapperComponent} from "../../shared/wrapper/wrapper.component";
import {AddSupplierComponent} from "../add-supplier/add-supplier.component";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {AvatarModule} from "primeng/avatar";

@Component({
    selector: 'supplier-list',
    templateUrl: './supplier-list.component.html',
    styleUrls: ['./supplier-list.component.less'],
    standalone: true,
    imports: [WrapperComponent, AddSupplierComponent, TableModule, ButtonModule, RouterLink, AvatarModule]
})
export class SupplierListComponent {
    pageTitle = "Suppliers";

    @Input()
    suppliers!: Supplier[];
    @Input()
    supplierTypes!: ConfigurationEntry[];
    @Output()
    deleteSupplierEvent: EventEmitter<SupplierDto> = new EventEmitter<SupplierDto>();

    showAddComponent: boolean = false;

    constructor() {
    }

    getLabelFromCategory(category: string): string {
        return resolveLabel(category, this.supplierTypes);
    }

    onClick() {
        this.showAddComponent = true;
    }

    onNotify($event: boolean) {
        this.showAddComponent = false;
    }

    getSupplierInitials(name: string): string {
        if (!name) return '?';
        const words = name.trim().split(/\s+/);
        return words.slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
    }

    onDeleteSupplier($event: MouseEvent, supplier: Supplier) {
        $event.stopPropagation();
        let supplierDto: SupplierDto;
        supplierDto = {
            id: supplier.id!,
            name: supplier.name!,
        }
        this.deleteSupplierEvent.emit(supplierDto);
    }
}
