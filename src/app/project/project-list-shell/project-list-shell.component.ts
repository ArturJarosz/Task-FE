import {ChangeDetectionStrategy, Component, computed, effect, inject, signal, Signal} from '@angular/core';
import {ProjectStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Project} from "../../generated/models/project";
import {ProjectStatus} from "../../generated/models/project-status";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ConfirmationService} from "primeng/api";
import {ProjectDto} from "../model/project.model";
import {ProjectListComponent} from "../project-list/project-list.component";
import {AddProjectComponent} from "../add-project/add-project.component";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {CurrencyPipe, NgFor} from "@angular/common";
import {KpiCardComponent, PageCrumb, PageHeaderComponent, TableFooterComponent} from "../../shared";

const PAGE_SIZE = 10;

export interface StatusSegment {
    key: string;
    label: string;
    statuses: ProjectStatus[] | null;
}

// The "Active" statuses come from the configuration endpoint, so the segments follow the configuration
function statusSegments(activeStatuses: ProjectStatus[]): StatusSegment[] {
    return [
        {key: 'all', label: 'All', statuses: null},
        {key: 'active', label: 'Active', statuses: activeStatuses},
        {key: 'finished', label: 'Finished', statuses: [ProjectStatus.DONE, ProjectStatus.COMPLETED]},
        {key: 'rejected', label: 'Rejected', statuses: [ProjectStatus.REJECTED]},
    ];
}

function inSegment(project: Project, segment: StatusSegment): boolean {
    return !segment.statuses || (!!project.status && segment.statuses.includes(project.status));
}

@Component({
    selector: 'project-list-shell',
    templateUrl: './project-list-shell.component.html',
    styleUrls: ['./project-list-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ProjectListComponent, AddProjectComponent, ButtonModule, ConfirmDialogModule, PageHeaderComponent, KpiCardComponent, TableFooterComponent, NgFor, CurrencyPipe]
})
export class ProjectListShellComponent {

    showComponent: boolean = false;

    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Projects'}];
    readonly pageSize = PAGE_SIZE;

    $projects: Signal<Project[] | null> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean | null> = this.projectStore.projectsNeedRefresh;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;
    $activeProjectStatuses: Signal<ProjectStatus[]> = this.configurationStore.configuration!.activeProjectStatuses;
    readonly $segments = computed(() => statusSegments(this.$activeProjectStatuses()));

    readonly $segmentKey = signal<string>('all');
    readonly $page = signal<number>(0);

    readonly $segment = computed(() => this.$segments().find(segment => segment.key === this.$segmentKey()) ?? this.$segments()[0]);
    readonly $filteredProjects = computed(() => (this.$projects() ?? []).filter(project => inSegment(project, this.$segment())));
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$filteredProjects().length / PAGE_SIZE), 1));
    readonly $pagedProjects = computed(() => {
        let start = this.$page() * PAGE_SIZE;
        return this.$filteredProjects().slice(start, start + PAGE_SIZE);
    });
    readonly $segmentCounts = computed(() => {
        let projects = this.$projects() ?? [];
        return Object.fromEntries(this.$segments().map(segment =>
            [segment.key, projects.filter(project => inSegment(project, segment)).length]));
    });
    readonly $kpis = computed(() => {
        let projects = this.$projects() ?? [];
        let counts = this.$segmentCounts();
        return {
            total: projects.length,
            active: counts['active'],
            finished: counts['finished'],
            value: projects.reduce((sum, project) => sum + (project.contract?.offerValue ?? 0), 0),
        };
    });
    readonly $emptyTitle = computed(() =>
        this.$segment().key === 'all' ? 'No projects yet' : `No ${this.$segment().label.toLowerCase()} projects`);
    readonly $emptyText = computed(() => this.$segment().key === 'all'
        ? 'Create a project to start tracking its contract, stages and payments.'
        : 'Pick another status to see the rest of your projects.');

    constructor(private confirmationService: ConfirmationService) {
        this.configurationStore.loadConfiguration({});
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({})
            }
        });
        // Keep the page in range when projects are removed
        effect(() => {
            if (this.$page() >= this.$pageCount()) {
                this.$page.set(this.$pageCount() - 1);
            }
        }, {allowSignalWrites: true});
    }

    onSelectSegment(key: string) {
        this.$segmentKey.set(key);
        this.$page.set(0);
    }

    onClick() {
        this.showComponent = !this.showComponent;
    }

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }

    onDeleteProject($event: ProjectDto) {
        this.projectStore.setProjectId($event.id);
        this.confirmationService.confirm({
            header: 'Delete project',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.projectStore.removeProject({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
