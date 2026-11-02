import {Injectable} from "@angular/core";
import {StageType} from "../../generated/models/stage-type";
import {NamedEntryRestService, NamedEntryRestServiceImpl} from "./named-entry-rest.service";

export abstract class StageTypeRestService extends NamedEntryRestService<StageType> {
}

@Injectable()
export class StageTypeRestServiceImpl extends NamedEntryRestServiceImpl<StageType> implements StageTypeRestService {
    constructor() {
        super('stage-types', 'stage type', 'stage types');
    }
}
