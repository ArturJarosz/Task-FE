import {Injectable} from "@angular/core";
import {ProjectType} from "../../generated/models/project-type";
import {NamedEntryRestService, NamedEntryRestServiceImpl} from "./named-entry-rest.service";

export abstract class ProjectTypeRestService extends NamedEntryRestService<ProjectType> {
}

@Injectable()
export class ProjectTypeRestServiceImpl extends NamedEntryRestServiceImpl<ProjectType> implements ProjectTypeRestService {
    constructor() {
        super('project-types', 'project type', 'project types');
    }
}
