import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {CurrencyPipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {endOfMonth, format, parseISO, startOfMonth} from "date-fns";
import {PopoverModule} from "primeng/popover";
import {DatePickerModule} from "primeng/datepicker";
import {ChipModule} from "primeng/chip";
import {Router} from "@angular/router";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {CompanyCostStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostRepeats} from "../../generated/models/company-cost-repeats";
import {EmptyStateComponent, KpiCardComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent, TableFooterComponent} from "../../shared";
import {SortValue, sortRows, TableSort} from "../../shared/utils/sort-utils";
import {CompanyCostListComponent, CompanyCostRow} from "../company-cost-list/company-cost-list.component";
import {CompanyCostDialogComponent} from "../company-cost-dialog/company-cost-dialog.component";
import {PayChargeDialogComponent} from "../pay-charge-dialog/pay-charge-dialog.component";
import {isEnded, isRecurring, monthLabel, periodLabel, repeatsLabel} from "../model/company-cost";
import {resolveKnownLabel} from "../../shared/utils/label-utils";

const PAGE_SIZE = 10;

interface CompanyCostSegment {
    key: string;
    label: string;
    matches: (row: CompanyCostRow) => boolean;
}

const SEGMENTS: CompanyCostSegment[] = [
    {key: 'all', label: 'All', matches: () => true},
    {key: 'recurring', label: 'Recurring', matches: row => isRecurring(row.companyCost) && !row.ended},
    {key: 'one-time', label: 'One-time', matches: row => !isRecurring(row.companyCost)},
    {key: 'ended', label: 'Ended', matches: row => row.ended},
];

@Component({
    selector: 'company-cost-list-shell',
    templateUrl: './company-cost-list-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CurrencyPipe, FormsModule, PopoverModule, DatePickerModule, ChipModule, ConfirmDialogModule, ButtonModule,
        SkeletonModule, EmptyStateComponent, KpiCardComponent, LoadErrorComponent, PageHeaderComponent,
        TableFooterComponent, CompanyCostListComponent, CompanyCostDialogComponent, PayChargeDialogComponent]
})
export class CompanyCostListShellComponent implements OnInit {
    readonly companyCostStore = inject(CompanyCostStore);
    readonly configurationStore = inject(ConfigurationStore);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly router = inject(Router);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Company costs'}];
    readonly segments = SEGMENTS;
    readonly pageSize = PAGE_SIZE;
    readonly $categories = this.configurationStore.configuration!.companyCostCategories;

    readonly $segmentKey = signal('all');
    readonly $page = signal(0);
    readonly $sort = signal<TableSort | null>(null);
    readonly $showNewCost = signal(false);
    // The cost whose next charge is being paid; the dialog is open while it is set
    readonly $payingCost = signal<CompanyCost | null>(null);

    // Skeletons show only until the first load
    readonly $loading = computed(() => this.companyCostStore.companyCostsNeedRefresh()
        && !this.companyCostStore.companyCosts().length && !this.companyCostStore.companyCostsLoadFailed());
    // Nothing to show after a failed load; a list loaded before stays with its toast
    readonly $loadFailed = computed(() => this.companyCostStore.companyCostsLoadFailed()
        && !this.companyCostStore.companyCosts().length);
    readonly $period = this.companyCostStore.period;
    // The period as the month range picker holds it
    readonly $periodRange = computed<Date[] | null>(() => {
        const period = this.$period();
        return period ? [parseISO(period.startDate), parseISO(period.endDate)] : null;
    });
    // "01.2026 – 06.2026", or "03.2026" for one month
    readonly $periodLabel = computed(() => {
        const period = this.$period();
        if (!period) {
            return '';
        }
        const start = monthLabel(period.startDate);
        const end = monthLabel(period.endDate);
        return start === end ? start : `${start} – ${end}`;
    });
    readonly $rows = computed<CompanyCostRow[]>(() => {
        const categories = this.$categories() ?? [];
        const period = this.$period();
        const year = new Date().getFullYear();
        return this.companyCostStore.companyCosts().map(companyCost => {
            const currentAmount = companyCost.amounts?.[0];
            const amountChangedThisYear = isRecurring(companyCost) && (companyCost.amounts?.length ?? 0) > 1
                && !!currentAmount?.validFrom && currentAmount.validFrom.startsWith(`${year}-`);
            return {
                companyCost,
                categoryLabel: resolveKnownLabel(companyCost.categoryId, categories),
                repeatsLabel: repeatsLabel(companyCost),
                periodLabel: periodLabel(companyCost),
                ended: isEnded(companyCost),
                amountSince: amountChangedThisYear ? `from ${monthLabel(currentAmount!.validFrom)}` : null,
                paid: (period ? companyCost.periodPaidNetValue : companyCost.paidThisYear) ?? 0,
            };
        });
    });
    readonly $segment = computed(() => SEGMENTS.find(segment => segment.key === this.$segmentKey()) ?? SEGMENTS[0]);
    readonly $segmentCounts = computed(() => Object.fromEntries(SEGMENTS.map(segment =>
        [segment.key, this.$rows().filter(segment.matches).length])));
    readonly $filteredRows = computed(() => this.$rows().filter(this.$segment().matches));
    readonly $sortedRows = computed(() => sortRows(this.$filteredRows(), this.$sort(), companyCostSortValue));
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$filteredRows().length / PAGE_SIZE), 1));
    readonly $pagedRows = computed(() =>
        this.$sortedRows().slice(this.$page() * PAGE_SIZE, (this.$page() + 1) * PAGE_SIZE));
    // With a period, the figures of its charges and payments; the list keeps only the costs charged or paid in it
    readonly $periodKpis = computed(() => {
        const costs = this.$rows().map(row => row.companyCost);
        const sum = (value: (companyCost: CompanyCost) => number | undefined) =>
            costs.reduce((total, companyCost) => total + (value(companyCost) ?? 0), 0);
        return {
            costs: costs.length,
            charges: sum(companyCost => companyCost.periodCharges),
            chargesNetValue: sum(companyCost => companyCost.periodChargesNetValue),
            paid: sum(companyCost => companyCost.periodPaidNetValue),
            overdueCharges: sum(companyCost => companyCost.periodOverdueCharges),
            overdueNetValue: sum(companyCost => companyCost.periodOverdueNetValue),
        };
    });
    readonly $kpis = computed(() => {
        const rows = this.$rows();
        const active = rows.filter(row => isRecurring(row.companyCost) && !row.ended);
        return {
            recurring: active.length,
            // Monthly costs only: quarterly and yearly ones would make the figure jump between months
            monthlyTotal: active.filter(row => row.companyCost.repeats === CompanyCostRepeats.MONTHLY)
                .reduce((sum, row) => sum + (row.companyCost.netValue ?? 0), 0),
            paidThisYear: rows.reduce((sum, row) => sum + (row.companyCost.paidThisYear ?? 0), 0),
            overdueCharges: rows.reduce((sum, row) => sum + (row.companyCost.overdueCharges ?? 0), 0),
            overdueNetValue: rows.reduce((sum, row) => sum + (row.companyCost.overdueNetValue ?? 0), 0),
        };
    });
    readonly $emptyTitle = computed(() => {
        const costs = this.$segment().key === 'all' ? 'company costs' : `${this.$segment().label.toLowerCase()} costs`;
        return this.$period() ? `No ${costs} charged or paid in ${this.$periodLabel()}` : `No ${costs} yet`;
    });
    readonly $emptyText = computed(() => this.$segment().key === 'all' && !this.$period()
        ? 'Add salaries, subscriptions and other costs outside projects, so the financial report counts them.'
        : '');

    constructor() {
        effect(() => {
            if (this.companyCostStore.companyCostsNeedRefresh()) {
                this.companyCostStore.loadCompanyCosts();
            }
        });
        effect(() => {
            if (this.$page() >= this.$pageCount()) {
                this.$page.set(this.$pageCount() - 1);
            }
        });
    }

    ngOnInit(): void {
        this.companyCostStore.loadCompanyCosts();
        this.configurationStore.loadConfiguration({});
    }

    onRetry(): void {
        this.companyCostStore.loadCompanyCosts();
    }

    // Applies once both months are picked; clearing the picker removes the period
    onPeriodChange(range: (Date | null)[] | null): void {
        if (!range?.[0]) {
            this.companyCostStore.setPeriod(null);
        } else if (range[1]) {
            this.companyCostStore.setPeriod({
                startDate: format(startOfMonth(range[0]), 'yyyy-MM-dd'),
                endDate: format(endOfMonth(range[1]), 'yyyy-MM-dd'),
            });
        } else {
            return;
        }
        this.$page.set(0);
    }

    onSelectSegment(key: string): void {
        this.$segmentKey.set(key);
        this.$page.set(0);
    }

    onSortChange(sort: TableSort | null): void {
        this.$sort.set(sort);
        this.$page.set(0);
    }

    onCreate(companyCost: CompanyCost): void {
        this.companyCostStore.createCompanyCost({
            companyCost, afterSave: created => {
                this.$showNewCost.set(false);
                this.router.navigate(['/company-costs', created.id]);
            }
        });
    }

    onPay(paymentDate: string): void {
        const companyCost = this.$payingCost()!;
        this.companyCostStore.savePayment({
            companyCostId: companyCost.id!,
            payment: {chargeMonth: companyCost.nextCharge!.chargeMonth, paymentDate},
            afterSave: () => this.$payingCost.set(null)
        });
    }

    onDelete(companyCost: CompanyCost): void {
        this.confirmationService.confirm({
            header: 'Delete company cost',
            message: `Delete ${companyCost.name}? Its payments are deleted too. This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => this.companyCostStore.deleteCompanyCost({companyCost}),
        });
    }
}

function companyCostSortValue(row: CompanyCostRow, field: string): SortValue {
    switch (field) {
        case 'name':
            return row.companyCost.name;
        case 'repeats':
            return row.repeatsLabel;
        case 'period':
            return row.companyCost.startMonth ?? row.companyCost.date;
        case 'netValue':
            return row.companyCost.netValue;
        case 'paid':
            return row.paid;
        case 'nextCharge':
            return row.companyCost.nextCharge?.chargeDate;
        default:
            return null;
    }
}
