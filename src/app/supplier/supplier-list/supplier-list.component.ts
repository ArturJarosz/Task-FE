import {Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {SupplierDto} from "../model/supplier";

@Component({
    selector: 'supplier-list',
    templateUrl: './supplier-list.component.html',
    styleUrls: ['./supplier-list.component.less']
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
