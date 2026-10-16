import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {Architect} from "../../generated/models/architect";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ProjectStatus} from "../../generated/models/project-status";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {EntityProjectsComponent, FieldComponent, PageCrumb, PageHeaderComponent} from "../../shared";

const ACTIVE_STATUSES: ProjectStatus[] = [ProjectStatus.TO_DO, ProjectStatus.IN_PROGRESS];

// Read-only: the backend has no endpoint to edit an architect, so there is no Edit button
@Component({
    selector: 'architect-detail',
    templateUrl: './architect-detail.component.html',
    styleUrls: ['./architect-detail.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, FieldComponent, EntityProjectsComponent, CurrencyPipe, DatePipe]
})
export class ArchitectDetailComponent implements OnChanges {
    @Input()
    architect!: Architect;
    @Input()
    projectsSummary: EntityProjectsSummary | null = null;
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];

    name: string = '';
    initials: string = '';
    activeProjects: number = 0;
    crumbs: PageCrumb[] = [];

    ngOnChanges(): void {
        this.name = `${this.architect.firstName ?? ''} ${this.architect.lastName ?? ''}`.trim();
        this.initials = `${this.architect.firstName?.charAt(0) ?? ''}${this.architect.lastName?.charAt(0) ?? ''}`.toUpperCase() || '?';
        this.activeProjects = (this.projectsSummary?.projects ?? [])
            .filter(project => !!project.status && ACTIVE_STATUSES.includes(project.status)).length;
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Architects', route: ['/architects']},
            {label: this.name},
        ];
    }
}
