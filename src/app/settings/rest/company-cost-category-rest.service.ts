import {Injectable} from "@angular/core";
import {CompanyCostCategory} from "../../generated/models/company-cost-category";
import {NamedEntryRestService, NamedEntryRestServiceImpl} from "./named-entry-rest.service";

export abstract class CompanyCostCategoryRestService extends NamedEntryRestService<CompanyCostCategory> {
}

@Injectable()
export class CompanyCostCategoryRestServiceImpl extends NamedEntryRestServiceImpl<CompanyCostCategory>
    implements CompanyCostCategoryRestService {
    constructor() {
        super('company-cost-categories', 'company cost category', 'company cost categories');
    }
}
