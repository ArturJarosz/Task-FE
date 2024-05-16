import {ChangeDetectionStrategy, Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ProjectState, ProjectStore} from "../state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {ArchitectState, getArchitects, loadArchitects} from "../../architect/state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ActivatedRoute, Router} from "@angular/router";
import {Architect} from "../../generated/models/architect";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'project-detail-shell',
    templateUrl: './project-detail-shell.component.html',
    styleUrls: ['./project-detail-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailShellComponent implements OnInit {
    architects$!: Observable<Architect[]>;

    projectId: number = 0;

    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);
    $project: Signal<Project | null> = this.projectStore.project!;
    $projectNeedsRefresh: Signal<boolean> = this.projectStore.projectNeedsRefresh!;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;
    $contractStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractStatuses;

    constructor(private route: ActivatedRoute, private projectStoreOld: Store<ProjectState>,
                private architectsStore: Store<ArchitectState>,
                private router: Router,
                private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$projectNeedsRefresh()) {
                this.projectStore.loadProject({});
            }
        })
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('id');
        this.projectId = Number(maybeProjectId);
        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});

        this.architectsStore.dispatch(loadArchitects());
        this.configurationStore.loadConfiguration({});

        this.architects$ = this.architectsStore.select(getArchitects);
    }

    onUpdateProject($event: Project) {
        this.projectStore.updateProject({project: $event});
    }

    onRemoveProject($event: void) {
        let projectName = this.projectStore.project()!.name;
        this.confirmationService.confirm({
            message: `Do you want to project task: ${projectName}?`,
            header: `Confirm project delete ${projectName}.`,
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
