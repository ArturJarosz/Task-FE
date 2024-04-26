import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {getProject, getProjectNeedsRefresh, loadProject, ProjectState} from "../state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {ArchitectState, getArchitects, loadArchitects} from "../../architect/state";
import {
    ConfigurationState,
    getContractStatusConfiguration,
    getProjectStatusConfiguration,
    getProjectTypeConfiguration, loadConfiguration
} from "../../shared/configuration/state";
import {ActivatedRoute} from "@angular/router";
import {Architect} from "../../generated/models/architect";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'project-detail-shell',
    templateUrl: './project-detail-shell.component.html',
    styleUrls: ['./project-detail-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailShellComponent implements OnInit {
    architects$!: Observable<Architect[]>;
    project$!: Observable<Project | null>;
    projectTypes$!: Observable<ConfigurationEntry[]>;
    projectStatuses$!: Observable<ConfigurationEntry[]>;
    contractStatuses$!: Observable<ConfigurationEntry[]>;
    projectNeedsRefresh$!: Observable<boolean>;

    projectId: number = 0;

    constructor(private route: ActivatedRoute, private projectStore: Store<ProjectState>,
                private architectsStore: Store<ArchitectState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('id');
        this.projectId = Number(maybeProjectId);

        this.projectStore.dispatch(loadProject({projectId: this.projectId}));
        this.architectsStore.dispatch(loadArchitects());
        this.configurationStore.dispatch(loadConfiguration());

        this.architects$ = this.architectsStore.select(getArchitects);
        this.project$ = this.projectStore.select(getProject);
        this.projectTypes$ = this.configurationStore.select(getProjectTypeConfiguration);
        this.projectStatuses$ = this.configurationStore.select(getProjectStatusConfiguration);
        this.contractStatuses$ = this.configurationStore.select(getContractStatusConfiguration);
        this.projectNeedsRefresh$ = this.projectStore.select(getProjectNeedsRefresh);

        this.projectNeedsRefresh$.subscribe({
            next: needsRefresh => {
                if (needsRefresh) {
                    this.refreshProject();
                }
            }
        })
    }

    private refreshProject() {
        this.projectStore.dispatch(loadProject({projectId: this.projectId}));
    }

}
