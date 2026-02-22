import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ContractorStore} from "../state";
import {ProjectStore} from "../../project/state";
import {ContractorContractorJobsData} from "../../generated/models/contractor-contractor-jobs-data";
import {Project} from "../../generated/models/project";


import {ContractorJobListComponent} from "../contractor-job-list/contractor-job-list.component";

@Component({
    selector: 'contractor-job-list-shell',
    templateUrl: './contractor-job-list-shell.component.html',
    styleUrl: './contractor-job-list-shell.component.less',
    standalone: true,
    imports: [ContractorJobListComponent]
})
export class ContractorJobListShellComponent implements OnInit {
    readonly contractorStore = inject(ContractorStore);
    readonly projectStore = inject(ProjectStore);

    $contractorContractorJobsData: Signal<ContractorContractorJobsData> = this.contractorStore.contractorJobsData;
    $contractorContractorJobsNeedRefresh: Signal<boolean> = this.contractorStore.contractorJobsDataNeedRefresh;
    $projects: Signal<Project[]> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean> = this.projectStore.projectsNeedRefresh;

    constructor() {
        effect(() => {
            if (this.$contractorContractorJobsNeedRefresh()) {
                this.contractorStore.loadContractorJobsData({});
            }
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({});
            }
        });
    }

    ngOnInit(): void {
        this.contractorStore.loadContractorJobsData({});
        this.projectStore.loadProjects({});
    }
}


