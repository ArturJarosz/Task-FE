import {Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {SupplyStore} from "../state/supply.state";
import {ActivatedRoute, Router} from "@angular/router";
import {Supply} from "../../../generated/models/supply";
import {ConfirmationService} from "primeng/api";
import {SupplierStore} from "../../../supplier/state";
import {Supplier} from "../../../generated/models/supplier";
import {ProjectStore} from "../../../project/state";
import {FinancialItem, FinancialItemDetailComponent, FinancialItemLabels} from "../../financial-item-detail/financial-item-detail.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";

const LABELS: FinancialItemLabels = {item: 'supply', partner: 'supplier', partnerRoute: 'suppliers', icon: 'pi pi-truck'};

@Component({
    selector: 'supply-detail-shell',
    templateUrl: './supply-detail-shell.component.html',
    styleUrl: './supply-detail-shell.component.less',
    standalone: true,
    imports: [FinancialItemDetailComponent, ConfirmDialogModule]
})
export class SupplyDetailShellComponent implements OnInit {
    projectId: number = 0;
    supplyId: number = 0;

    readonly supplyStore = inject(SupplyStore);
    readonly supplierStore = inject(SupplierStore);
    readonly projectStore = inject(ProjectStore);
    readonly labels = LABELS;
    // While the store still holds a supply from another page, show skeletons instead of the wrong one
    $supply: Signal<Supply | null> = computed(() => this.supplyStore.supply()?.id === this.supplyId ? this.supplyStore.supply() : null);
    $item: Signal<FinancialItem | null> = computed(() => {
        const supply = this.$supply();
        return supply ? {...supply, partnerId: supply.supplierId} : null;
    });
    $supplyLoadFailed: Signal<boolean> = this.supplyStore.supplyLoadFailed;
    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers;
    // Breadcrumb only
    $projectName: Signal<string> = computed(() =>
        this.projectStore.project()?.id === this.projectId ? this.projectStore.projectName() : '');

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {
        effect(() => {
            if (this.supplyStore.supplyNeedsRefresh() && this.supplyStore.projectId() && this.supplyStore.supplyId()) {
                this.supplyStore.loadSupply({});
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.params['projectId'];
        let maybeSupplyId = this.route.snapshot.params['supplyId'];

        this.projectId = Number(maybeProjectId);
        this.supplyId = Number(maybeSupplyId);

        this.supplyStore.setProjectId(this.projectId);
        this.supplyStore.setSupplyId(this.supplyId);

        this.supplyStore.loadSupply({});
        this.supplierStore.loadSuppliers({});
        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});
    }

    updateSupply({partnerId, ...item}: FinancialItem): void {
        this.supplyStore.updateSupply({supply: {...item, supplierId: partnerId}});
    }

    deleteSupply($event: { id: number, name: string }): void {
        this.confirmationService.confirm({
            header: 'Delete supply',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.supplyStore.deleteSupply({});
                this.router.navigate([`/projects/${this.projectId}/finance`], {queryParams: {tab: 'supplies'}});
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        });
    }

    onReload(): void {
        this.supplyStore.loadSupply({});
    }
}
