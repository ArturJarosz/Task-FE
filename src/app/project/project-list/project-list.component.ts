import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {Project} from "../project";
import {Store} from "@ngrx/store";
import {getProjects, loadProjects, ProjectState} from "../state";

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.less']
})
export class ProjectListComponent implements OnInit, OnDestroy {
    private projectSubscription!: Subscription;
    projects: Project[] = [];

    constructor(private projectStore: Store<ProjectState>) {
    }

    ngOnInit(): void {
        this.projectStore.dispatch(loadProjects());
        this.projectSubscription = this.projectStore.select(getProjects)
            .subscribe({
                next: projects => this.projects = projects
            })
    }

    ngOnDestroy(): void {
        this.projectSubscription.unsubscribe();
    }

}
