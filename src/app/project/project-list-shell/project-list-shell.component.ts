import {ChangeDetectionStrategy, Component, computed, effect, inject, signal, Signal} from '@angular/core';
import {toSignal} from "@angular/core/rxjs-interop";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs";
import {startOfDay} from "date-fns";
import {updateAtMidnight} from "../../shared/utils/date-utils";
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
import {CurrencyPipe} from "@angular/common";
import {ChipModule} from "primeng/chip";
import {SkeletonModule} from "primeng/skeleton";
import {EmptyStateComponent, KpiCardComponent, PageCrumb, PageHeaderComponent, TableFooterComponent} from "../../shared";
import {ProjectsTimelineComponent} from "../projects-timeline/projects-timeline.component";
import {ProjectFilterComponent} from "../project-filter/project-filter.component";
import {
    architectName,
    clientName,
    EMPTY_FILTER,
    filterChips,
    filterOptions,
    matchesFilter,
    ProjectFilter,
    withoutFilter
} from "../project-filter/project-filter";
import {earliest, isDate, toDay} from "../timeline/timeline-scale";

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

function countBySegment(projects: Project[], segments: StatusSegment[]): Record<string, number> {
    return Object.fromEntries(segments.map(segment => [segment.key, projects.filter(project => inSegment(project, segment)).length]));
}

// The `view` query parameter; none means the table
export type ProjectsView = 'table' | 'timeline';

// By where the first bar starts: the contract or project start (the timeline draws nothing for a row without one);
// projects with no start last
function byFirstStart(projects: Project[]): Project[] {
    let first = (project: Project) =>
        earliest([toDay(project.contract?.startDate), toDay(project.startDate)].filter(isDate))?.getTime() ?? Infinity;
    return [...projects].sort((a, b) => first(a) - first(b) || (a.name ?? '').localeCompare(b.name ?? '', 'pl'));
}

@Component({
    selector: 'project-list-shell',
    templateUrl: './project-list-shell.component.html',
    styleUrls: ['./project-list-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ProjectListComponent, AddProjectComponent, ButtonModule, ConfirmDialogModule, PageHeaderComponent, KpiCardComponent,
        TableFooterComponent, CurrencyPipe, ChipModule, SkeletonModule, EmptyStateComponent, ProjectsTimelineComponent, ProjectFilterComponent]
})
export class ProjectListShellComponent {

    showComponent: boolean = false;

    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Projects'}];
    readonly pageSize = PAGE_SIZE;

    $projects: Signal<Project[] | null> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean | null> = this.projectStore.projectsNeedRefresh;
    $projectsLoadFailed: Signal<boolean> = this.projectStore.projectsLoadFailed;
    // Until the first load ends; later reloads keep the rows on screen
    readonly $loading = computed(() => !!this.$projectsNeedRefresh() && !this.$projectsLoadFailed() && (this.$projects() ?? []).length === 0);
    // Only when there is nothing to show: a failed reload keeps the projects already loaded (the REST service shows the toast)
    readonly $loadFailed = computed(() => this.$projectsLoadFailed() && (this.$projects() ?? []).length === 0);
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;
    $activeProjectStatuses: Signal<ProjectStatus[]> = this.configurationStore.configuration!.activeProjectStatuses;
    $contractStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractStatuses;
    readonly $segments = computed(() => statusSegments(this.$activeProjectStatuses()));

    readonly $view: Signal<ProjectsView> = toSignal(this.route.queryParamMap.pipe(
        map(params => params.get('view') === 'timeline' ? 'timeline' as const : 'table' as const)), {initialValue: 'table'});
    readonly $segmentKey = signal<string>('all');
    readonly $filter = signal<ProjectFilter>(EMPTY_FILTER);
    readonly $page = signal<number>(0);
    // Today for the date filters (period, past deadline); moves at midnight, like the timeline's own today
    private readonly $today = signal(startOfDay(new Date()));

    readonly $clients = computed(() => filterOptions((this.$projects() ?? []).map(project => project.client), clientName));
    readonly $architects = computed(() => filterOptions((this.$projects() ?? []).map(project => project.architect), architectName));
    readonly $filterChips = computed(() => filterChips(this.$filter(), {
        clients: this.$clients(), architects: this.$architects(),
        projectTypes: this.$projectTypes(), contractStatuses: this.$contractStatuses()
    }));
    // The projects the Filter popover lets through; the status segments split these
    readonly $matchingProjects = computed(() => (this.$projects() ?? []).filter(project => matchesFilter(project, this.$filter(), this.$today())));

    readonly $segment = computed(() => this.$segments().find(segment => segment.key === this.$segmentKey()) ?? this.$segments()[0]);
    readonly $filteredProjects = computed(() => this.$matchingProjects().filter(project => inSegment(project, this.$segment())));
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$filteredProjects().length / PAGE_SIZE), 1));
    readonly $pagedProjects = computed(() => {
        let start = this.$page() * PAGE_SIZE;
        return this.$filteredProjects().slice(start, start + PAGE_SIZE);
    });
    readonly $pagedTimelineProjects = computed(() => {
        let start = this.$page() * PAGE_SIZE;
        return byFirstStart(this.$filteredProjects()).slice(start, start + PAGE_SIZE);
    });
    readonly $segmentCounts = computed(() => countBySegment(this.$matchingProjects(), this.$segments()));
    // Every project, whatever the filters
    readonly $kpis = computed(() => {
        let projects = this.$projects() ?? [];
        let counts = countBySegment(projects, this.$segments());
        return {
            total: projects.length,
            active: counts['active'],
            finished: counts['finished'],
            value: projects.reduce((sum, project) => sum + (project.contract?.offerValue ?? 0), 0),
        };
    });
    readonly $filtersOn = computed(() => this.$filterChips().length > 0);
    readonly $emptyTitle = computed(() => this.$filtersOn() ? 'No projects match these filters'
        : this.$segment().key === 'all' ? 'No projects yet' : `No ${this.$segment().label.toLowerCase()} projects`);
    readonly $emptyText = computed(() => this.$filtersOn()
        ? 'Change or clear the filters to see more projects.'
        : this.$segment().key === 'all'
            ? 'Create a project to start tracking its contract, stages and payments.'
            : 'Pick another status to see the rest of your projects.');

    constructor(private confirmationService: ConfirmationService) {
        this.configurationStore.loadConfiguration({});
        updateAtMidnight(() => this.$today.set(startOfDay(new Date())));
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

    onSelectView(view: ProjectsView) {
        if (view === this.$view()) {
            return;
        }
        this.$page.set(0);
        this.router.navigate([], {relativeTo: this.route, queryParams: {view: view === 'timeline' ? 'timeline' : null}, queryParamsHandling: 'merge'});
    }

    onFilterChange(filter: ProjectFilter) {
        this.$filter.set(filter);
        this.$page.set(0);
    }

    onRemoveFilter(key: keyof ProjectFilter) {
        this.onFilterChange(withoutFilter(this.$filter(), key));
    }

    onClearFilters() {
        this.onFilterChange(EMPTY_FILTER);
    }

    onReloadProjects() {
        this.projectStore.setProjectsNeedRefresh();
        this.projectStore.loadProjects({});
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
