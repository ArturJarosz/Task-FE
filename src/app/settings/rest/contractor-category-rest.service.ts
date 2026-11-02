import {Injectable} from "@angular/core";
import {ContractorCategory} from "../../generated/models/contractor-category";
import {NamedEntryRestService, NamedEntryRestServiceImpl} from "./named-entry-rest.service";

export abstract class ContractorCategoryRestService extends NamedEntryRestService<ContractorCategory> {
}

@Injectable()
export class ContractorCategoryRestServiceImpl extends NamedEntryRestServiceImpl<ContractorCategory> implements ContractorCategoryRestService {
    constructor() {
        super('contractor-categories', 'contractor category', 'contractor categories');
    }
}
