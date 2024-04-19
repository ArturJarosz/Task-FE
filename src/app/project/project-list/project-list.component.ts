import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project} from "../model/project";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {Client, ClientType} from "../../client/model/client";
import {resolveLabel} from "../../shared/utils/label-utils";

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
