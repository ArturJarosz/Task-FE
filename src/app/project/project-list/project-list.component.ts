import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Architect, Client, ClientType, ConfigurationEntry, Project} from "../../generated/models";
import {ProjectDto} from "../model/project.model";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";
import {Menu, MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {Router, RouterLink} from "@angular/router";
import {TooltipModule} from "primeng/tooltip";
import {CurrencyPipe} from "@angular/common";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";
import {architectName, clientName} from "../project-filter/project-filter";

const NOT_FOUND_INITIAL = '?';

@Component({
    selector: 'project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TableModule, ButtonModule, TagModule, MenuModule, RouterLink, TooltipModule, CurrencyPipe, EmptyStateComponent, NotSetComponent]
})
export class ProjectListComponent {
    @Input()
    projects: Project[] | null = [];
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Input()
    emptyTitle: string = 'No projects yet';
    @Input()
    emptyText: string = 'Create a project to start tracking its contract, stages and payments.';
    @Output()
    deleteProjectEvent: EventEmitter<ProjectDto> = new EventEmitter<ProjectDto>();

    protected readonly statusSeverity = statusSeverity;
    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

    getProjectTypeLabel(typeId?: number): string {
        return resolveLabel(typeId, this.projectTypes);
    }

    getProjectStatusLabel(type: string): string {
        return resolveLabel(type, this.projectStatuses);
    }

    getClientName(client?: Client): string {
        return clientName(client);
    }

    getClientKind(client?: Client): string {
        return client?.clientType === ClientType.CORPORATE ? 'Company' : 'Private';
    }

    getInitials(name: string): string {
        let initials = name.split(' ')
            .filter(part => part.length > 0)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join('');
        return initials || NOT_FOUND_INITIAL;
    }

    getArchitectName(architect?: Architect): string {
        return architectName(architect);
    }

    openRowMenu($event: MouseEvent, project: Project, menu: Menu) {
        $event.stopPropagation();
        this.rowMenuItems = [
            {label: 'Open', icon: 'pi pi-arrow-right', command: () => this.router.navigate(['/projects', project.id])},
            {label: 'Delete project', icon: 'pi pi-trash', command: () => this.deleteProject(project.name!, project.id!)}
        ];
        menu.toggle($event);
    }

    deleteProject(name: string, id: number) {
        this.deleteProjectEvent.emit({name: name, id: id});
    }
}
