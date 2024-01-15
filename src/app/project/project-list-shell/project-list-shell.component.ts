import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {getProjects, loadProjects, ProjectState} from "../state";
import {
    ConfigurationState,
    getProjectStatusConfiguration,
    getProjectTypeConfiguration
} from "../../shared/configuration/state";
import {Observable} from "rxjs";
import {Project} from "../project";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";

@Component({
    selector: 'project-list-shell',
    templateUrl: './project-list-shell.component.html',
    styleUrls: ['./project-list-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListShellComponent implements OnInit {
    projects$!: Observable<Project[]>;
    projectTypes$!: Observable<ConfigurationEntry[]>;
    projectStatuses$!: Observable<ConfigurationEntry[]>;
    showComponent: boolean = false;

    constructor(private projectStore: Store<ProjectState>, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.projectStore.dispatch(loadProjects());
        this.projects$ = this.projectStore.select(getProjects);
        this.projectTypes$ = this.configurationStore.select(getProjectTypeConfiguration);
        this.projectStatuses$ = this.configurationStore.select(getProjectStatusConfiguration);
    }

    onClick() {
        this.showComponent = !this.showComponent;
    }

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }

    refreshProjects() {
        this.projectStore.dispatch(loadProjects());
        this.projects$ = this.projectStore.select(getProjects);
    }

}
