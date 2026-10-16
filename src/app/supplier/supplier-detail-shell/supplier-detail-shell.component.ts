import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {SupplierStore} from "../state";
import {ProjectStore} from "../../project/state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Supplier} from "../../generated/models/supplier";
import {SupplierSuppliesData} from "../../generated/models/supplier-supplies-data";
import {SupplierCategory} from "../../generated/models/supplier-category";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {SkeletonModule} from "primeng/skeleton";
import {NgIf} from "@angular/common";
import {Partner, PartnerDetailComponent, PartnerItemsData, PartnerRef} from "../../shared";

@Component({
    selector: 'supplier-detail-shell',
    templateUrl: './supplier-detail-shell.component.html',
    styleUrl: './supplier-detail-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PartnerDetailComponent, ConfirmDialogModule, SkeletonModule, NgIf]
})
export class SupplierDetailShellComponent implements OnInit {
    supplierId!: number;

    readonly supplierStore = inject(SupplierStore);
    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);

    $supplierNeedsRefresh: Signal<boolean> = this.supplierStore.supplierNeedsRefresh!;
    $suppliesDataNeedRefresh: Signal<boolean> = this.supplierStore.suppliesDataNeedRefresh;
    $supplierTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.supplierTypes;
    $projects: Signal<Project[]> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean> = this.projectStore.projectsNeedRefresh;

    // The store keeps the previously opened supplier until the new one loads, so only show a matching one
    $supplier: Signal<Supplier | null> = computed(() => {
        let supplier = this.supplierStore.supplier();
        return supplier && supplier.id === this.supplierStore.supplierId() ? supplier : null;
    });
    $itemsData: Signal<PartnerItemsData> = computed(() => {
        let data: SupplierSuppliesData = this.supplierStore.suppliesData();
        return {
            items: data.supplies ?? [],
            financialData: data.financialData,
            averageFinancialData: data.averageFinancialData,
        };
    });
    $projectNames: Signal<Map<number, string>> = computed(() =>
        new Map((this.$projects() ?? []).map(project => [project.id!, project.name ?? ''])));

    constructor(private route: ActivatedRoute, private confirmationService: ConfirmationService,
                private router: Router) {
        effect(() => {
            if (this.$supplierNeedsRefresh()) {
                this.supplierStore.loadSupplier({});
            }
        });
        effect(() => {
            if (this.$suppliesDataNeedRefresh()) {
                this.supplierStore.loadSupplierData({});
            }
        });
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({});
            }
        });
    }

    ngOnInit(): void {
        let maybeId = this.route.snapshot.paramMap.get('supplierId');
        this.supplierId = Number(maybeId);
        this.supplierStore.setSupplierId(this.supplierId);
        this.supplierStore.loadSupplier({});
        this.supplierStore.loadSupplierData({});
        this.projectStore.loadProjects({});
        this.configurationStore.loadConfiguration({});
    }

    onUpdate($event: Partner) {
        let supplier: Supplier = {
            name: $event.name,
            category: $event.category as SupplierCategory,
            email: $event.email,
            telephone: $event.telephone,
            note: $event.note,
        };
        this.supplierStore.updateSupplier({supplier: supplier});
    }

    onDelete($event: PartnerRef) {
        this.confirmationService.confirm({
            header: 'Delete supplier',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.supplierStore.setSupplierId($event.id);
                this.supplierStore.deleteSupplier({});
                this.router.navigate(['/suppliers']);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
