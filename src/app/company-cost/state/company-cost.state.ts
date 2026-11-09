import {inject} from "@angular/core";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, Observable, pipe, switchMap, tap} from "rxjs";
import {MessageService} from "primeng/api";
import {AppState} from "../../state/app.store";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostAmount} from "../../generated/models/company-cost-amount";
import {CompanyCostCharge} from "../../generated/models/company-cost-charge";
import {CompanyCostPayment} from "../../generated/models/company-cost-payment";
import {CompanyCostPeriod, CompanyCostRestService} from "../rest/company-cost-rest.service";
import {MessageSeverity} from "../../shared/message";
import {chargeYearRange} from "../model/company-cost";
import {FinancialReportStore} from "../../financial-report/state/financial-report.state";
import {DashboardStore} from "../../dashboard/state/dashboard.state";

export interface CompanyCostState extends AppState {
    // The period the list is filtered by; it stays while the user moves around the app
    period: CompanyCostPeriod | null;
    companyCosts: CompanyCost[];
    companyCostsNeedRefresh: boolean;
    companyCostsLoadFailed: boolean;
    // The cost of the detail page
    companyCostId: number | undefined;
    companyCost: CompanyCost | null;
    companyCostNeedsRefresh: boolean;
    companyCostLoadFailed: boolean;
    // Charges of the detail page's cost in chargesYear, newest first
    chargesYear: number;
    charges: CompanyCostCharge[];
    // The cost and year the charges belong to, so charges of another cost or year never show while new ones load
    chargesKey: string | null;
    chargesLoadFailed: boolean;
    // A cost, an amount or a payment is being saved
    saving: boolean;
}

const initialState: CompanyCostState = {
    period: null,
    companyCosts: [],
    companyCostsNeedRefresh: true,
    companyCostsLoadFailed: false,
    companyCostId: undefined,
    companyCost: null,
    companyCostNeedsRefresh: true,
    companyCostLoadFailed: false,
    chargesYear: new Date().getFullYear(),
    charges: [],
    chargesKey: null,
    chargesLoadFailed: false,
    saving: false,
}

export function chargesKey(companyCostId: number | undefined, year: number): string {
    return `${companyCostId}-${year}`;
}

// Company costs, the cost on its own page with the charges of one year, and every change to them. Payments are
// expenses of the financial report, so every change marks the report and the dashboard's report stale.
export const CompanyCostStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, companyCostRestService = inject(CompanyCostRestService),
                 financialReportStore = inject(FinancialReportStore), dashboardStore = inject(DashboardStore),
                 messageService = inject(MessageService)) => {
        const loadCharges = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {chargesLoadFailed: false})),
                switchMap(() => {
                    const companyCostId = store.companyCostId();
                    const year = store.chargesYear();
                    if (companyCostId === undefined) {
                        return EMPTY;
                    }
                    return companyCostRestService.getCharges(companyCostId, year)
                        .pipe(
                            tap(charges => patchState(store, {charges, chargesKey: chargesKey(companyCostId, year)})),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {chargesLoadFailed: true});
                                return EMPTY;
                            })
                        );
                })
            )
        );
        // Holds the cost of the detail page, with the charges year moved into the years the cost has charges in
        const setCompanyCost = (companyCost: CompanyCost) => {
            const {first, last} = chargeYearRange(companyCost);
            const chargesYear = Math.min(Math.max(store.chargesYear(), first), last);
            patchState(store, {companyCost, companyCostNeedsRefresh: false});
            if (chargesYear !== store.chargesYear()) {
                patchState(store, {chargesYear});
                loadCharges();
            }
        };
        const loadCompanyCost = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {companyCostLoadFailed: false})),
                switchMap(() => {
                    const companyCostId = store.companyCostId();
                    if (companyCostId === undefined || !store.companyCostNeedsRefresh()) {
                        return EMPTY;
                    }
                    return companyCostRestService.getCompanyCost(companyCostId)
                        .pipe(
                            tap(companyCost => setCompanyCost(companyCost)),
                            catchError(() => {
                                patchState(store, {companyCostLoadFailed: true});
                                return EMPTY;
                            })
                        );
                })
            )
        );
        const loadCompanyCosts = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {companyCostsLoadFailed: false})),
                // A new period cancels the load of the previous one
                switchMap(() => {
                    if (!store.companyCostsNeedRefresh()) {
                        return EMPTY;
                    }
                    return companyCostRestService.getCompanyCosts(store.period())
                        .pipe(
                            tap(companyCosts => patchState(store, {companyCosts, companyCostsNeedRefresh: false})),
                            catchError(() => {
                                patchState(store, {companyCostsLoadFailed: true});
                                return EMPTY;
                            })
                        );
                })
            )
        );
        // After any change of a cost: the list, the cost's page and its charges load again, and the reports too
        const afterChange = (companyCostId: number, companyCost?: CompanyCost) => {
            patchState(store, {companyCostsNeedRefresh: true});
            if (store.companyCostId() === companyCostId) {
                if (companyCost) {
                    setCompanyCost(companyCost);
                } else {
                    patchState(store, {companyCostNeedsRefresh: true});
                    loadCompanyCost();
                }
                loadCharges();
            }
            financialReportStore.setReportNeedsRefresh();
            dashboardStore.setReportNeedsRefresh();
        };
        // Runs a save; afterSave runs only when it worked, so a dialog stays open with what was typed after an error
        const save = <T>(request: Observable<T>, onSaved: (saved: T) => void, afterSave?: () => void) => {
            patchState(store, {saving: true});
            return request.pipe(
                tap(saved => {
                    onSaved(saved);
                    afterSave?.();
                }),
                catchError(() => EMPTY),
                finalize(() => patchState(store, {saving: false}))
            );
        };
        const success = (summary: string, detail: string) =>
            messageService.add({severity: MessageSeverity.SUCCESS, summary, detail});

        return {
            setCompanyCostId(companyCostId: number): void {
                if (store.companyCostId() !== companyCostId) {
                    patchState(store, {
                        companyCostId, companyCostNeedsRefresh: true, chargesYear: new Date().getFullYear()
                    });
                }
            },
            setChargesYear(year: number): void {
                patchState(store, {chargesYear: year});
                loadCharges();
            },
            setCompanyCostsNeedRefresh(): void {
                patchState(store, {companyCostsNeedRefresh: true});
            },
            // Drops the list of the previous period, so its rows never show while the new ones load, and loads the new
            // one: the refresh flag may already be set by a load still running, so a page watching it wouldn't
            setPeriod(period: CompanyCostPeriod | null): void {
                const current = store.period();
                if (current?.startDate !== period?.startDate || current?.endDate !== period?.endDate) {
                    patchState(store, {period, companyCosts: [], companyCostsNeedRefresh: true});
                    loadCompanyCosts();
                }
            },
            loadCompanyCosts: loadCompanyCosts,
            loadCompanyCost: loadCompanyCost,
            // Loads the cost again even when it is held, as payments change with the date
            reloadCompanyCost(): void {
                patchState(store, {companyCostNeedsRefresh: true});
                loadCompanyCost();
            },
            loadCharges: loadCharges,
            createCompanyCost: rxMethod<{ companyCost: CompanyCost, afterSave?: (created: CompanyCost) => void }>(
                pipe(
                    concatMap(({companyCost, afterSave}) => save(companyCostRestService.createCompanyCost(companyCost),
                        created => {
                            afterChange(created.id!);
                            success('Company cost created', `${created.name} was added.`);
                            afterSave?.(created);
                        }))
                )
            ),
            updateCompanyCost: rxMethod<{ companyCostId: number, companyCost: CompanyCost, afterSave?: () => void }>(
                pipe(
                    concatMap(({companyCostId, companyCost, afterSave}) => save(
                        companyCostRestService.updateCompanyCost(companyCostId, companyCost), saved => {
                            afterChange(companyCostId, saved);
                            success('Company cost saved', `${saved.name} was saved.`);
                        }, afterSave))
                )
            ),
            deleteCompanyCost: rxMethod<{ companyCost: CompanyCost, afterDelete?: () => void }>(
                pipe(
                    concatMap(({companyCost, afterDelete}) => save(
                        companyCostRestService.deleteCompanyCost(companyCost.id!), () => {
                            // Forgotten first, so the change doesn't load the deleted cost again
                            if (store.companyCostId() === companyCost.id) {
                                patchState(store, {companyCostId: undefined, companyCost: null});
                            }
                            afterChange(companyCost.id!);
                            success('Company cost deleted', `${companyCost.name} was deleted.`);
                        }, afterDelete))
                )
            ),
            saveAmount: rxMethod<{ companyCostId: number, amount: CompanyCostAmount, afterSave?: () => void }>(
                pipe(
                    concatMap(({companyCostId, amount, afterSave}) => save(amount.id == null
                        ? companyCostRestService.createAmount(companyCostId, amount)
                        : companyCostRestService.updateAmount(companyCostId, amount.id, amount), saved => {
                        afterChange(companyCostId, saved);
                        success('Amount saved', `${saved.name} has the new amount.`);
                    }, afterSave))
                )
            ),
            deleteAmount: rxMethod<{ companyCostId: number, amountId: number }>(
                pipe(
                    concatMap(({companyCostId, amountId}) => save(
                        companyCostRestService.deleteAmount(companyCostId, amountId), saved => {
                            afterChange(companyCostId, saved);
                            success('Amount deleted', `${saved.name} uses the amount before it.`);
                        }))
                )
            ),
            // Marks a charge as paid (a payment without id) or changes the payment date of a paid one
            savePayment: rxMethod<{ companyCostId: number, payment: CompanyCostPayment, afterSave?: () => void }>(
                pipe(
                    concatMap(({companyCostId, payment, afterSave}) => save(payment.id == null
                        ? companyCostRestService.createPayment(companyCostId, payment)
                        : companyCostRestService.updatePayment(companyCostId, payment.id, payment), () => {
                        afterChange(companyCostId);
                        success(payment.id == null ? 'Marked as paid' : 'Payment saved',
                            'The financial report counts it on the payment date.');
                    }, afterSave))
                )
            ),
            deletePayment: rxMethod<{ companyCostId: number, paymentId: number }>(
                pipe(
                    concatMap(({companyCostId, paymentId}) => save(
                        companyCostRestService.deletePayment(companyCostId, paymentId), () => {
                            afterChange(companyCostId);
                            success('Marked as not paid', 'The financial report no longer counts it.');
                        }))
                )
            ),
        };
    })
)
