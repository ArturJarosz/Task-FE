import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {CompanyCostStore, chargesKey} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostAmount} from "../../generated/models/company-cost-amount";
import {CompanyCostCharge} from "../../generated/models/company-cost-charge";
import {CompanyCostDetailComponent} from "../company-cost-detail/company-cost-detail.component";
import {CompanyCostDialogComponent} from "../company-cost-dialog/company-cost-dialog.component";
import {PayChargeDialogComponent} from "../pay-charge-dialog/pay-charge-dialog.component";
import {AmountDialogComponent} from "../amount-dialog/amount-dialog.component";
import {EndCostDialogComponent} from "../end-cost-dialog/end-cost-dialog.component";
import {isRecurring, monthLabel} from "../model/company-cost";
import {resolveKnownLabel} from "../../shared/utils/label-utils";

@Component({
    selector: 'company-cost-detail-shell',
    templateUrl: './company-cost-detail-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    providers: [DatePipe],
    imports: [ConfirmDialogModule, CompanyCostDetailComponent, CompanyCostDialogComponent, PayChargeDialogComponent,
        AmountDialogComponent, EndCostDialogComponent]
})
export class CompanyCostDetailShellComponent implements OnInit {
    readonly companyCostStore = inject(CompanyCostStore);
    readonly configurationStore = inject(ConfigurationStore);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly datePipe = inject(DatePipe);

    private companyCostId = 0;
    readonly $categories = this.configurationStore.configuration!.companyCostCategories;
    // While the store still holds another cost, show skeletons instead of the wrong one
    readonly $companyCost = computed(() =>
        this.companyCostStore.companyCost()?.id === this.companyCostId ? this.companyCostStore.companyCost() : null);
    readonly $charges = computed(() => this.companyCostStore.chargesKey()
        === chargesKey(this.companyCostId, this.companyCostStore.chargesYear()) ? this.companyCostStore.charges() : null);
    readonly $categoryLabel = computed(() => resolveKnownLabel(this.$companyCost()?.categoryId, this.$categories()));

    readonly $editing = signal(false);
    readonly $endingCost = signal(false);
    // The charge being paid or whose payment is edited
    readonly $payingCharge = signal<CompanyCostCharge | null>(null);
    // The amount being changed: null closed, an empty object for a new amount
    readonly $editedAmount = signal<CompanyCostAmount | null>(null);

    ngOnInit(): void {
        this.companyCostId = Number(this.route.snapshot.paramMap.get('companyCostId'));
        this.companyCostStore.setCompanyCostId(this.companyCostId);
        this.configurationStore.loadConfiguration({});
        // Overdue charges and the paid totals follow today's date, so the cost always loads on open
        this.companyCostStore.reloadCompanyCost();
        this.companyCostStore.loadCharges();
    }

    onSave(companyCost: CompanyCost): void {
        this.companyCostStore.updateCompanyCost({
            companyCostId: this.companyCostId, companyCost, afterSave: () => this.$editing.set(false)
        });
    }

    onEndCost(endMonth: string): void {
        this.companyCostStore.updateCompanyCost({
            companyCostId: this.companyCostId, companyCost: {...this.scheduleOf(this.$companyCost()!), endMonth},
            afterSave: () => this.$endingCost.set(false)
        });
    }

    onRestartCost(): void {
        const companyCost = this.$companyCost()!;
        this.confirmationService.confirm({
            header: 'Restart cost',
            message: `Remove the end month of ${companyCost.name}? It is charged again every period after `
                + `${monthLabel(companyCost.endMonth)}.`,
            icon: 'pi pi-replay',
            acceptButtonProps: {label: 'Restart cost'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => this.companyCostStore.updateCompanyCost({
                companyCostId: this.companyCostId, companyCost: {...this.scheduleOf(companyCost), endMonth: undefined}
            }),
        });
    }

    onDelete(): void {
        const companyCost = this.$companyCost()!;
        this.confirmationService.confirm({
            header: 'Delete company cost',
            message: `Delete ${companyCost.name}? Its payments are deleted too. This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => this.companyCostStore.deleteCompanyCost({
                companyCost, afterDelete: () => this.router.navigate(['/company-costs'])
            }),
        });
    }

    onSaveAmount(amount: CompanyCostAmount): void {
        this.companyCostStore.saveAmount({
            companyCostId: this.companyCostId, amount, afterSave: () => this.$editedAmount.set(null)
        });
    }

    onDeleteAmount(amount: CompanyCostAmount): void {
        this.confirmationService.confirm({
            header: 'Delete amount',
            message: `Delete the amount from ${monthLabel(amount.validFrom)}? The amount before it applies instead. `
                + `Paid charges don't change.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => this.companyCostStore.deleteAmount({companyCostId: this.companyCostId, amountId: amount.id!}),
        });
    }

    onPay(paymentDate: string): void {
        const charge = this.$payingCharge()!;
        this.companyCostStore.savePayment({
            companyCostId: this.companyCostId,
            payment: {id: charge.paymentId, chargeMonth: charge.chargeMonth, paymentDate},
            afterSave: () => this.$payingCharge.set(null)
        });
    }

    onUnpay(charge: CompanyCostCharge): void {
        this.confirmationService.confirm({
            header: 'Mark as not paid',
            message: `Mark the charge of ${this.datePipe.transform(charge.chargeDate, 'dd.MM.yyyy')} as not paid? `
                + `The financial report no longer counts it.`,
            icon: 'pi pi-undo',
            acceptButtonProps: {label: 'Mark as not paid'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => this.companyCostStore.deletePayment({
                companyCostId: this.companyCostId, paymentId: charge.paymentId!
            }),
        });
    }

    onRetry(): void {
        this.companyCostStore.reloadCompanyCost();
    }

    // What a PUT of the schedule needs, so ending or restarting keeps everything else as it is
    private scheduleOf(companyCost: CompanyCost): CompanyCost {
        return {
            name: companyCost.name,
            categoryId: companyCost.categoryId,
            hasInvoice: companyCost.hasInvoice,
            note: companyCost.note,
            repeats: companyCost.repeats,
            startMonth: companyCost.startMonth,
            endMonth: companyCost.endMonth,
            chargeDay: companyCost.chargeDay,
            ...(isRecurring(companyCost) ? {} : {date: companyCost.date, netValue: companyCost.netValue}),
        };
    }
}
