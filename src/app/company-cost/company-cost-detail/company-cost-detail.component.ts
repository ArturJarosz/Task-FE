import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {CurrencyPipe, DatePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {MenuModule} from "primeng/menu";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {TableModule} from "primeng/table";
import {SelectModule} from "primeng/select";
import {SkeletonModule} from "primeng/skeleton";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostAmount} from "../../generated/models/company-cost-amount";
import {CompanyCostCharge} from "../../generated/models/company-cost-charge";
import {EmptyStateComponent, FieldComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent} from "../../shared";
import {paidSeverity} from "../../shared/status-severity";
import {chargeYearRange, isEnded, isRecurring, monthLabel, periodLabel, repeatsLabel} from "../model/company-cost";
import {format, parseISO, subMonths} from "date-fns";

export interface AmountRow {
    amount: CompanyCostAmount;
    from: string;
    // "02.2026", or null for the current amount of a cost without end month
    until: string | null;
    current: boolean;
    first: boolean;
}

@Component({
    selector: 'company-cost-detail',
    templateUrl: './company-cost-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CurrencyPipe, DatePipe, FormsModule, ButtonModule, MenuModule, TooltipModule, TagModule, TableModule,
        SelectModule, SkeletonModule, EmptyStateComponent, FieldComponent, LoadErrorComponent, PageHeaderComponent]
})
export class CompanyCostDetailComponent implements OnChanges {
    @Input()
    companyCost: CompanyCost | null = null;
    @Input()
    loadFailed = false;
    @Input()
    categoryLabel = '';
    @Input()
    charges: CompanyCostCharge[] | null = null;
    @Input()
    chargesLoadFailed = false;
    @Input()
    chargesYear = new Date().getFullYear();
    @Output()
    reload = new EventEmitter<void>();
    @Output()
    reloadCharges = new EventEmitter<void>();
    @Output()
    chargesYearChange = new EventEmitter<number>();
    @Output()
    edit = new EventEmitter<void>();
    @Output()
    deleteCost = new EventEmitter<void>();
    @Output()
    changeAmount = new EventEmitter<void>();
    @Output()
    editAmount = new EventEmitter<CompanyCostAmount>();
    @Output()
    deleteAmount = new EventEmitter<CompanyCostAmount>();
    @Output()
    endCost = new EventEmitter<void>();
    @Output()
    restartCost = new EventEmitter<void>();
    @Output()
    payCharge = new EventEmitter<CompanyCostCharge>();
    @Output()
    editPayment = new EventEmitter<CompanyCostCharge>();
    @Output()
    unpayCharge = new EventEmitter<CompanyCostCharge>();

    crumbs: PageCrumb[] = [];
    actions: MenuItem[] = [];
    rowMenuItems: MenuItem[] = [];
    amountRows: AmountRow[] = [];
    years: { label: string, value: number }[] = [];
    readonly paidSeverity = paidSeverity;

    get recurring(): boolean {
        return !!this.companyCost && isRecurring(this.companyCost);
    }

    get ended(): boolean {
        return !!this.companyCost && isEnded(this.companyCost);
    }

    get repeats(): string {
        return this.companyCost ? repeatsLabel(this.companyCost) : '';
    }

    get period(): string {
        return this.companyCost ? periodLabel(this.companyCost) : '';
    }

    // "Every month from 03.2024, on the 15th"
    get schedule(): string {
        const companyCost = this.companyCost;
        if (!companyCost || !this.recurring) {
            return this.period;
        }
        const months = companyCost.endMonth
            ? `${monthLabel(companyCost.startMonth)} – ${monthLabel(companyCost.endMonth)}`
            : `from ${monthLabel(companyCost.startMonth)}`;
        return `${this.repeats}, ${months}, on day ${companyCost.chargeDay}`;
    }

    ngOnChanges(): void {
        const companyCost = this.companyCost;
        this.crumbs = [{label: 'Home', route: ['/home']}, {label: 'Company costs', route: ['/company-costs']},
            {label: companyCost?.name ?? 'Company cost'}];
        if (!companyCost) {
            return;
        }
        this.actions = [
            ...(this.recurring && !this.ended
                ? [{label: 'Change amount', icon: 'pi pi-wallet', command: () => this.changeAmount.emit()}] : []),
            ...(this.recurring
                ? [companyCost.endMonth
                    ? {label: 'Restart cost', icon: 'pi pi-replay', command: () => this.restartCost.emit()}
                    : {label: 'End cost', icon: 'pi pi-stop-circle', command: () => this.endCost.emit()}] : []),
            {label: 'Delete', icon: 'pi pi-trash', command: () => this.deleteCost.emit()},
        ];
        // Newest first, as the backend sends them; each runs until the month before the next one
        const amounts = companyCost.amounts ?? [];
        this.amountRows = amounts.map((amount, index) => ({
            amount,
            from: monthLabel(amount.validFrom),
            until: index === 0
                ? (companyCost.endMonth ? monthLabel(companyCost.endMonth) : null)
                : format(subMonths(parseISO(amounts[index - 1].validFrom!), 1), 'MM.yyyy'),
            current: index === 0,
            first: index === amounts.length - 1,
        }));
        const {first, last} = chargeYearRange(companyCost);
        this.years = [];
        for (let year = last; year >= first; year--) {
            this.years.push({label: String(year), value: year});
        }
    }

    openAmountMenu($event: MouseEvent, row: AmountRow, menu: { toggle: (event: Event) => void }): void {
        this.rowMenuItems = [
            {label: 'Edit amount', icon: 'pi pi-pencil', command: () => this.editAmount.emit(row.amount)},
            ...(row.first ? [] : [{label: 'Delete', icon: 'pi pi-trash', command: () => this.deleteAmount.emit(row.amount)}]),
        ];
        menu.toggle($event);
    }

    openChargeMenu($event: MouseEvent, charge: CompanyCostCharge, menu: { toggle: (event: Event) => void }): void {
        this.rowMenuItems = charge.paid
            ? [
                {label: 'Edit payment', icon: 'pi pi-pencil', command: () => this.editPayment.emit(charge)},
                {label: 'Mark as not paid', icon: 'pi pi-undo', command: () => this.unpayCharge.emit(charge)},
            ]
            : [{label: 'Mark as paid', icon: 'pi pi-check', command: () => this.payCharge.emit(charge)}];
        menu.toggle($event);
    }
}
