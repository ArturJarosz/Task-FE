import {ChangeDetectionStrategy, Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ProjectState, ProjectStore} from "../state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {ArchitectState, getArchitects, loadArchitects} from "../../architect/state";
import {
    ConfigurationState,
    getContractStatusConfiguration,
    getProjectStatusConfiguration,
    getProjectTypeConfiguration,
    loadConfiguration
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
    projectTypes$!: Observable<ConfigurationEntry[]>;
    projectStatuses$!: Observable<ConfigurationEntry[]>;
    contractStatuses$!: Observable<ConfigurationEntry[]>;

    projectId: number = 0;

    projectStore = inject(ProjectStore);
    $project: Signal<Project | null> = this.projectStore.project!;
    $projectNeedsRefresh: Signal<boolean> = this.projectStore.projectNeedsRefresh!;

    constructor(private route: ActivatedRoute, private projectStoreOld: Store<ProjectState>,
                private architectsStore: Store<ArchitectState>,
                private configurationStore: Store<ConfigurationState>) {
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
        this.configurationStore.dispatch(loadConfiguration());

        this.architects$ = this.architectsStore.select(getArchitects);
        this.projectTypes$ = this.configurationStore.select(getProjectTypeConfiguration);
        this.projectStatuses$ = this.configurationStore.select(getProjectStatusConfiguration);
        this.contractStatuses$ = this.configurationStore.select(getContractStatusConfiguration);
    }
}
