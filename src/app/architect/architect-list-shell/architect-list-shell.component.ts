import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, Signal} from '@angular/core';
import {ArchitectStore} from "../state";
import {ProjectStore} from "../../project/state";
import {Architect} from "../../generated/models/architect";
import {Project} from "../../generated/models/project";
import {ProjectStatus} from "../../generated/models/project-status";
import {ArchitectListComponent, ArchitectRow} from "../architect-list/architect-list.component";
import {PageCrumb, PageHeaderComponent, TableFooterComponent} from "../../shared";

const PAGE_SIZE = 10;
const ACTIVE_STATUSES: ProjectStatus[] = [ProjectStatus.TO_DO, ProjectStatus.IN_PROGRESS];

@Component({
    selector: 'architect-list-shell',
    templateUrl: './architect-list-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ArchitectListComponent, PageHeaderComponent, TableFooterComponent]
})
export class ArchitectListShellComponent implements OnInit {
    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Architects'}];
    readonly pageSize = PAGE_SIZE;

    $architects: Signal<Architect[]> = this.architectStore.architects!;
    $architectsNeedRefresh: Signal<boolean> = this.architectStore.architectsNeedRefresh!;
    $projects: Signal<Project[] | null> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean> = this.projectStore.projectsNeedRefresh;

    readonly $page = signal<number>(0);

    // Project counts come from the projects list already kept in ProjectStore
    readonly $rows = computed<ArchitectRow[]>(() => {
        let projects = this.$projects() ?? [];
        return (this.$architects() ?? []).map(architect => {
            let own = projects.filter(project => project.architect?.id === architect.id);
            return {
                architect: architect,
                projects: own.length,
                activeProjects: own.filter(project => !!project.status && ACTIVE_STATUSES.includes(project.status)).length,
            };
        });
    });
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$rows().length / PAGE_SIZE), 1));
    readonly $pagedRows = computed(() => this.$rows().slice(this.$page() * PAGE_SIZE, (this.$page() + 1) * PAGE_SIZE));
    readonly $kpis = computed(() => {
        let rows = this.$rows();
        return {
            architects: rows.length,
            withActiveProjects: rows.filter(row => row.activeProjects > 0).length,
        };
    });

    constructor() {
        effect(() => {
            if (this.$architectsNeedRefresh()) {
                this.architectStore.loadArchitects({});
            }
        });
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({});
            }
        });
        effect(() => {
            if (this.$page() >= this.$pageCount()) {
                this.$page.set(this.$pageCount() - 1);
            }
        }, {allowSignalWrites: true});
    }

    ngOnInit(): void {
        this.architectStore.loadArchitects({});
        this.projectStore.loadProjects({});
    }
}
