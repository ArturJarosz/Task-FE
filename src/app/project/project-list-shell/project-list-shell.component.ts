import {ChangeDetectionStrategy, Component, effect, inject, Signal} from '@angular/core';
import {ProjectStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Router} from "@angular/router";
import {ConfirmationService} from "primeng/api";
import {ProjectDto} from "../model/project.model";

@Component({
    selector: 'project-list-shell',
    templateUrl: './project-list-shell.component.html',
    styleUrls: ['./project-list-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListShellComponent {

    showComponent: boolean = false;

    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);

    $projects: Signal<Project[] | null> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean | null> = this.projectStore.projectsNeedRefresh;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;

    constructor(private router: Router, private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({})
            }
        });
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
            message: `Do you want to project task: ${$event.name}?`,
            header: `Confirm project delete ${$event.name}.`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.projectStore.removeProject({});
                this.router.navigate([`/projects`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
