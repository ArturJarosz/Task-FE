import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, Signal} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Supplier} from "../../generated/models/supplier";
import {SupplierStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ButtonModule} from "primeng/button";
import {AddSupplierComponent} from "../add-supplier/add-supplier.component";
import {
    PageCrumb,
    PageHeaderComponent,
    PartnerListComponent,
    PartnerRef,
    PartnerRow,
    TableFooterComponent
} from "../../shared";
import {resolveLabel} from "../../shared/utils/label-utils";

const PAGE_SIZE = 10;

@Component({
    selector: 'app-supplier-list-shell',
    templateUrl: './supplier-list-shell.component.html',
    styleUrl: './supplier-list-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PartnerListComponent, AddSupplierComponent, ConfirmDialogModule, ButtonModule, PageHeaderComponent, TableFooterComponent]
})
export class SupplierListShellComponent implements OnInit {

    readonly supplierStore = inject(SupplierStore);
    readonly configurationStore = inject(ConfigurationStore);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Suppliers'}];
    readonly pageSize = PAGE_SIZE;

    $supplierTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.supplierTypes;
    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers!;
    $suppliersNeedRefresh: Signal<boolean> = this.supplierStore.suppliersNeedRefresh!;

    readonly $page = signal<number>(0);
    showAdd: boolean = false;

    readonly $rows = computed<PartnerRow[]>(() => (this.$suppliers() ?? []).map(item => ({
        id: item.id!,
        name: item.name ?? '',
        category: resolveLabel(item.category, this.$supplierTypes()),
        email: item.email,
        telephone: item.telephone,
        count: item.numberOfSupplies ?? 0,
    })));
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$rows().length / PAGE_SIZE), 1));
    readonly $pagedRows = computed(() => this.$rows().slice(this.$page() * PAGE_SIZE, (this.$page() + 1) * PAGE_SIZE));
    readonly $kpis = computed(() => ({
        total: this.$rows().length,
        withItems: this.$rows().filter(row => row.count > 0).length,
    }));

    constructor(private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$suppliersNeedRefresh()) {
                this.supplierStore.loadSuppliers({});
            }
        });
        effect(() => {
            if (this.$page() >= this.$pageCount()) {
                this.$page.set(this.$pageCount() - 1);
            }
        }, {allowSignalWrites: true});
    }

    ngOnInit(): void {
        this.supplierStore.loadSuppliers({});
        this.configurationStore.loadConfiguration({});
    }

    onAdd() {
        this.showAdd = true;
    }

    onAddClosed() {
        this.showAdd = false;
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
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
