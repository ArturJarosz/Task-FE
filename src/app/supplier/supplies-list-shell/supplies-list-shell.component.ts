import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {SupplierStore} from "../state";
import {SupplierSuppliesData} from "../../generated/models/supplier-supplies-data";
import {ProjectStore} from "../../project/state";
import {Project} from "../../generated/models/project";

import {SuppliesListComponent} from "../supplies-list/supplies-list.component";

@Component({
    selector: 'supplier-supplies-list-shell',
    templateUrl: './supplies-list-shell.component.html',
    styleUrl: './supplies-list-shell.component.less',
    standalone: true,
    imports: [SuppliesListComponent]
})
export class SuppliesListShellComponent implements OnInit {
    readonly supplierStore = inject(SupplierStore);
    readonly projectStore = inject(ProjectStore);

    $supplierSuppliesData: Signal<SupplierSuppliesData> = this.supplierStore.suppliesData;
    $supplierSuppliesNeedRefresh: Signal<boolean> = this.supplierStore.suppliesDataNeedRefresh;
    $projects: Signal<Project[]> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean> = this.projectStore.projectsNeedRefresh;

    constructor() {
        effect(() => {
            if (this.$supplierSuppliesNeedRefresh()) {
                this.supplierStore.loadSupplierData({});
            }
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({});
            }
        });
    }

    ngOnInit(): void {
        this.supplierStore.loadSupplierData({});
        this.projectStore.loadProjects({});
    }
}
