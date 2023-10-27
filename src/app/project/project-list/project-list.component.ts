import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {Project} from "../project";
import {Store} from "@ngrx/store";
import {getProjects, loadProjects, ProjectState} from "../state";
import {
    ConfigurationState,
    getProjectStatusConfiguration,
    getProjectTypeConfiguration
} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.less']
})
export class ProjectListComponent implements OnInit, OnDestroy {
    private projectSubscription!: Subscription;
    projects: Project[] = [];
    projectTypes: ConfigurationEntry[] = [];
    projectStatuses: ConfigurationEntry[] = [];

    constructor(private projectStore: Store<ProjectState>, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.projectStore.dispatch(loadProjects());
        this.projectSubscription = this.projectStore.select(getProjects)
            .subscribe({
                next: projects => this.projects = projects
            })
        this.configurationStore.select(getProjectTypeConfiguration)
            .subscribe({
                next: projectTypes => this.projectTypes = projectTypes
            })
        this.configurationStore.select(getProjectStatusConfiguration)
            .subscribe({
                next: projectStatuses => this.projectStatuses = projectStatuses
            })
    }

    ngOnDestroy(): void {
        this.projectSubscription.unsubscribe();

    }

    getProjectTypeLabel(type: string): string {
        let maybeLabel = this.projectTypes.find(element => element.id === type)?.label;
        return maybeLabel ? maybeLabel : type;
    }

    getProjectStatusLabel(type: string): string {
        let maybeLabel = this.projectStatuses.find(element => element.id === type)?.label;
        return maybeLabel ? maybeLabel : type;
    }

}
