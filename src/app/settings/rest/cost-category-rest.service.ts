import {Injectable} from "@angular/core";
import {CostCategory} from "../../generated/models/cost-category";
import {NamedEntryRestService, NamedEntryRestServiceImpl} from "./named-entry-rest.service";

export abstract class CostCategoryRestService extends NamedEntryRestService<CostCategory> {
}

@Injectable()
export class CostCategoryRestServiceImpl extends NamedEntryRestServiceImpl<CostCategory> implements CostCategoryRestService {
    constructor() {
        super('cost-categories', 'cost category', 'cost categories');
    }
}
