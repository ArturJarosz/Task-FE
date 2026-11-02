import {Injectable} from "@angular/core";
import {SupplierCategory} from "../../generated/models/supplier-category";
import {NamedEntryRestService, NamedEntryRestServiceImpl} from "./named-entry-rest.service";

export abstract class SupplierCategoryRestService extends NamedEntryRestService<SupplierCategory> {
}

@Injectable()
export class SupplierCategoryRestServiceImpl extends NamedEntryRestServiceImpl<SupplierCategory> implements SupplierCategoryRestService {
    constructor() {
        super('supplier-categories', 'supplier category', 'supplier categories');
    }
}
