import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project} from "../model/project";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {Client, ClientType} from "../../client/model/client";

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
        let maybeLabel = this.projectTypes!.find(element => element.id === type)?.label;
        return maybeLabel ? maybeLabel : type;
    }

    getProjectStatusLabel(type: string): string {
        let maybeLabel = this.projectStatuses!.find(element => element.id === type)?.label;
        return maybeLabel ? maybeLabel : type;
    }

    getClientName(client: Client) {
        if (client.clientType === ClientType.CORPORATE) {
            return client.companyName;
        }
        return `${client.firstName} ${client.lastName}`;
    }
}
