import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Client, ClientType, Project} from "../../generated/models";

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
}
