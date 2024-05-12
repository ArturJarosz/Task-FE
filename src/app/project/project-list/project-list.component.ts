import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Client, ClientType, ConfigurationEntry, Project} from "../../generated/models";
import {ProjectDto} from "../model/project.model";

@Component({
    selector: 'project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent {
    @Input()
    projects: Project[] | null = [];
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Output()
    deleteProjectEvent: EventEmitter<ProjectDto> = new EventEmitter<ProjectDto>();

    getProjectTypeLabel(type: string): string {
        return resolveLabel(type, this.projectTypes);
    }

    getProjectStatusLabel(type: string): string {
        return resolveLabel(type, this.projectStatuses);
    }

    getClientName(client: Client) {
        if (client.clientType === ClientType.CORPORATE) {
            return client.companyName;
        }
        return `${client.firstName} ${client.lastName}`;
    }

    deleteProject($event: MouseEvent, name: string, id: number) {
        $event.stopPropagation();
        this.deleteProjectEvent.emit({name: name, id: id});
    }
}
