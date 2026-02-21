import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Architect, Client, ClientType, ConfigurationEntry, Project} from "../../generated/models";
import {ProjectDto} from "../model/project.model";

const ARCHITECT_NOT_FOUND_INITIAL = '?';

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

    getArchitectInitials(architect?: Architect): string {
        if (architect?.firstName && architect?.lastName) {
            return `${architect.firstName.charAt(0)}${architect.lastName.charAt(0)}`.toUpperCase();
        }
        return ARCHITECT_NOT_FOUND_INITIAL;
    }

    getArchitectName(architect?: Architect): string {
        if (architect?.firstName && architect?.lastName) {
            return `${architect.firstName} ${architect.lastName}`;
        }
        return '';
    }

    deleteProject($event: MouseEvent, name: string, id: number) {
        $event.stopPropagation();
        this.deleteProjectEvent.emit({name: name, id: id});
    }
}
