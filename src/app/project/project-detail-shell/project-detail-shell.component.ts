import {Component, OnInit} from '@angular/core';
import {getProject, loadProject, ProjectState} from "../state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {Project} from "../model/project";
import {Architect} from "../../architect/model/architect";
import {ArchitectState, getArchitects} from "../../architect/state";
import {
    ConfigurationState,
    getContractStatusConfiguration,
    getProjectStatusConfiguration,
    getProjectTypeConfiguration, getStageStatusConfiguration, getStageTypeConfiguration
} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-project-detail-shell',
    templateUrl: './project-detail-shell.component.html',
    styleUrls: ['./project-detail-shell.component.less']
})
export class ProjectDetailShellComponent implements OnInit {
    architects$!: Observable<Architect[]>;
    project$!: Observable<Project | null>;
    projectTypes$!: Observable<ConfigurationEntry[]>;
    projectStatuses$!: Observable<ConfigurationEntry[]>;
    contractStatuses$!: Observable<ConfigurationEntry[]>;

    projectId: number = 0;

    constructor(private route: ActivatedRoute, private projectStore: Store<ProjectState>,
                private architectsStore: Store<ArchitectState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('id');
        this.projectId = Number(maybeProjectId);
        this.projectStore.dispatch(loadProject({projectId: this.projectId}));

        this.architects$ = this.architectsStore.select(getArchitects);
        this.project$ = this.projectStore.select(getProject);
        this.projectTypes$ = this.configurationStore.select(getProjectTypeConfiguration);
        this.projectStatuses$ = this.configurationStore.select(getProjectStatusConfiguration);
        this.contractStatuses$ = this.configurationStore.select(getContractStatusConfiguration);
    }
}
