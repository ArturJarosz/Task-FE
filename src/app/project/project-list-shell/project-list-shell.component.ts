import {ChangeDetectionStrategy, Component, effect, inject, OnInit, Signal} from '@angular/core';
import {Store} from "@ngrx/store";
import {ProjectState, ProjectStore} from "../state";
import {
    ConfigurationState,
    getProjectStatusConfiguration,
    getProjectTypeConfiguration
} from "../../shared/configuration/state";
import {Observable} from "rxjs";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'project-list-shell',
    templateUrl: './project-list-shell.component.html',
    styleUrls: ['./project-list-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListShellComponent implements OnInit {
    projectTypes$!: Observable<ConfigurationEntry[]>;
    projectStatuses$!: Observable<ConfigurationEntry[]>;
    showComponent: boolean = false;

    readonly projectStore = inject(ProjectStore);
    $projects: Signal<Project[] | null> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean | null> = this.projectStore.projectsNeedRefresh;

    constructor(private projectStoreOld: Store<ProjectState>, private configurationStore: Store<ConfigurationState>) {
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({})
            }
        });
    }

    ngOnInit(): void {
        this.projectTypes$ = this.configurationStore.select(getProjectTypeConfiguration);
        this.projectStatuses$ = this.configurationStore.select(getProjectStatusConfiguration);
    }

    onClick() {
        this.showComponent = !this.showComponent;
    }

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }

}
