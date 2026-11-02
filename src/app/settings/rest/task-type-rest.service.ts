import {Injectable} from "@angular/core";
import {TaskType} from "../../generated/models/task-type";
import {NamedEntryRestService, NamedEntryRestServiceImpl} from "./named-entry-rest.service";

export abstract class TaskTypeRestService extends NamedEntryRestService<TaskType> {
}

@Injectable()
export class TaskTypeRestServiceImpl extends NamedEntryRestServiceImpl<TaskType> implements TaskTypeRestService {
    constructor() {
        super('task-types', 'task type', 'task types');
    }
}
