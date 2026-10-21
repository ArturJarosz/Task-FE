import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, Signal} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Contractor} from "../../generated/models/contractor";
import {ContractorStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ButtonModule} from "primeng/button";
import {AddContractorComponent} from "../add-contractor/add-contractor.component";
import {
    KpiCardComponent,
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
    selector: 'contractor-list-shell',
    templateUrl: './contractor-list-shell.component.html',
    styleUrl: './contractor-list-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PartnerListComponent, AddContractorComponent, ConfirmDialogModule, ButtonModule, PageHeaderComponent, KpiCardComponent, TableFooterComponent]
})
export class ContractorListShellComponent implements OnInit {

    readonly contractorStore = inject(ContractorStore);
    readonly configurationStore = inject(ConfigurationStore);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Contractors'}];
    readonly pageSize = PAGE_SIZE;

    $contractorTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractorTypes;
    $contractors: Signal<Contractor[]> = this.contractorStore.contractors!;
    $contractorsNeedRefresh: Signal<boolean> = this.contractorStore.contractorsNeedRefresh!;

    readonly $page = signal<number>(0);
    showAdd: boolean = false;

    readonly $rows = computed<PartnerRow[]>(() => (this.$contractors() ?? []).map(item => ({
        id: item.id!,
        name: item.name ?? '',
        category: resolveLabel(item.category, this.$contractorTypes()),
        email: item.email,
        telephone: item.telephone,
        count: item.numberOfContractorJobs ?? 0,
    })));
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$rows().length / PAGE_SIZE), 1));
    readonly $pagedRows = computed(() => this.$rows().slice(this.$page() * PAGE_SIZE, (this.$page() + 1) * PAGE_SIZE));
    readonly $kpis = computed(() => ({
        total: this.$rows().length,
        withItems: this.$rows().filter(row => row.count > 0).length,
    }));

    constructor(private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$contractorsNeedRefresh()) {
                this.contractorStore.loadContractors({});
            }
        });
        effect(() => {
            if (this.$page() >= this.$pageCount()) {
                this.$page.set(this.$pageCount() - 1);
            }
        }, {allowSignalWrites: true});
    }

    ngOnInit(): void {
        this.contractorStore.loadContractors({});
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
            header: 'Delete contractor',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.contractorStore.setContractorId($event.id);
                this.contractorStore.deleteContractor({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
