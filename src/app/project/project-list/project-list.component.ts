import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {Project} from "../project";
import {ProjectRestService} from "../rest/project-rest.service";

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.less']
})
export class ProjectListComponent implements OnInit, OnDestroy {
    private projectSubscription!: Subscription;
    projects: Project[] = [];

    constructor(private projectRestService: ProjectRestService) {
    }

    ngOnInit(): void {
        this.projectSubscription = this.projectRestService.getProjects()
            .subscribe({
                next: projects => {
                    this.projects = projects;
                    console.log(JSON.stringify(projects))
                }
            })
    }

    ngOnDestroy(): void {
        this.projectSubscription.unsubscribe();
    }

}
