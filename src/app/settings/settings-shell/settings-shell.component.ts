import {FinancialReportStore} from "../../financial-report/state/financial-report.state";
import {DashboardStore} from "../../dashboard/state/dashboard.state";
import {isRateParameter} from "../system-parameter-format";
import {ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked} from '@angular/core';
import {SelectModule} from "primeng/select";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {PageCrumb, PageHeaderComponent} from "../../shared";
import {SystemParameter} from "../../generated/models/system-parameter";
import {
    ContractorCategoryStore,
    CostCategoryStore,
    CompanyCostCategoryStore,
    GoogleCalendarSettingsStore,
    NamedEntryStore,
    ProjectTypeStore,
    StageTypeStore,
    SupplierCategoryStore,
    SystemParameterStore,
    TaskTypeStore
} from "../state";
import {EditSystemParameterComponent} from "../edit-system-parameter/edit-system-parameter.component";
import {SystemParameterListComponent} from "../system-parameter-list/system-parameter-list.component";
import {AppearanceSettingsComponent} from "../appearance-settings/appearance-settings.component";
import {GoogleCalendarSettingsComponent} from "../google-calendar-settings/google-calendar-settings.component";
import {GoogleCalendarSharesComponent} from "../google-calendar-shares/google-calendar-shares.component";
import {CalendarShare} from "../../generated/models/calendar-share";
import {GoogleCalendarConnectionStatus} from "../../generated/models/google-calendar-connection-status";
import {GOOGLE_CALENDAR_PARAMETERS, toGoogleCalendarParameters} from "../google-calendar-parameters";
import {THEME_COLOR_PARAMETER} from "../../theme/theme-colors";
import {SETTINGS_SECTION_GROUPS, SETTINGS_SECTIONS} from "./settings-sections";
import {NamedEntryListComponent} from "../named-entry-list/named-entry-list.component";
import {EditNamedEntryComponent} from "../edit-named-entry/edit-named-entry.component";
import {
    CONTRACTOR_CATEGORY_TEXTS,
    COST_CATEGORY_TEXTS,
    COMPANY_COST_CATEGORY_TEXTS,
    NamedEntry,
    NamedEntryTexts,
    PROJECT_TYPE_TEXTS,
    STAGE_TYPE_TEXTS,
    SUPPLIER_CATEGORY_TEXTS,
    TASK_TYPE_TEXTS
} from "../named-entry";
import {ButtonModule} from "primeng/button";
import {ArchitectAccountListComponent} from "../architect-account-list/architect-account-list.component";
import {LinkAccountComponent} from "../link-account/link-account.component";
import {ArchitectStore} from "../../architect/state";
import {Architect} from "../../generated/models/architect";
import {UserStore} from "../../shared/user/state";
import {architectName} from "../../project/project-filter/project-filter";

// What the shell needs from the store of one list of named entries (project types, contractor categories...)
interface NamedEntrySection {
    texts: NamedEntryTexts;
    store: NamedEntryStore;
}

@Component({
    selector: 'settings-shell',
    templateUrl: './settings-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, SystemParameterListComponent, EditSystemParameterComponent,
        AppearanceSettingsComponent, GoogleCalendarSettingsComponent, GoogleCalendarSharesComponent, ConfirmDialogModule,
        RouterLink, RouterLinkActive, NamedEntryListComponent, EditNamedEntryComponent, ButtonModule,
        ArchitectAccountListComponent, LinkAccountComponent, SelectModule, FormsModule]
})
export class SettingsShellComponent {
    readonly systemParameterStore = inject(SystemParameterStore);
    readonly googleCalendarSettingsStore = inject(GoogleCalendarSettingsStore);
    readonly architectStore = inject(ArchitectStore);
    readonly financialReportStore = inject(FinancialReportStore);
    readonly dashboardStore = inject(DashboardStore);
    readonly userStore = inject(UserStore);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly confirmationService = inject(ConfirmationService);

    protected readonly GoogleCalendarConnectionStatus = GoogleCalendarConnectionStatus;

    readonly sectionGroups = SETTINGS_SECTION_GROUPS;

    // The phone's select: the same routes as the nav links
    onSelectSection(key: string): void {
        this.router.navigate(['/settings', key]);
    }

    private readonly $sectionKey = toSignal(this.route.paramMap.pipe(map(params => params.get('section'))));
    readonly $section = computed(() => SETTINGS_SECTIONS.find(section => section.key === this.$sectionKey()));
    readonly $crumbs = computed<PageCrumb[]>(() => [
        {label: 'Home', route: ['/home']},
        {label: 'Settings', route: ['/settings']},
        {label: this.$section()?.label ?? ''},
    ]);

    // The theme color and the Google Calendar parameters have their own sections
    readonly $systemParameters = computed(() => this.systemParameterStore.systemParameters()
        .filter(parameter => parameter.name !== THEME_COLOR_PARAMETER
            && !GOOGLE_CALENDAR_PARAMETERS.includes(parameter.name ?? '')));
    readonly $themeColorParameter = computed(() => this.systemParameterStore.systemParameters()
        .find(parameter => parameter.name === THEME_COLOR_PARAMETER));
    readonly $loading = this.systemParameterStore.systemParametersNeedRefresh;
    readonly $loadFailed = this.systemParameterStore.systemParametersLoadFailed;
    readonly $editedParameter = signal<SystemParameter | null>(null);

    // Sections that list named entries, by section key
    private readonly namedEntrySections: Record<string, NamedEntrySection> = {
        'project-types': {texts: PROJECT_TYPE_TEXTS, store: inject(ProjectTypeStore)},
        'stage-types': {texts: STAGE_TYPE_TEXTS, store: inject(StageTypeStore)},
        'task-types': {texts: TASK_TYPE_TEXTS, store: inject(TaskTypeStore)},
        'contractor-categories': {texts: CONTRACTOR_CATEGORY_TEXTS, store: inject(ContractorCategoryStore)},
        'supplier-categories': {texts: SUPPLIER_CATEGORY_TEXTS, store: inject(SupplierCategoryStore)},
        'cost-categories': {texts: COST_CATEGORY_TEXTS, store: inject(CostCategoryStore)},
        'company-cost-categories': {texts: COMPANY_COST_CATEGORY_TEXTS, store: inject(CompanyCostCategoryStore)},
    };
    readonly $namedEntrySection = computed(() => this.namedEntrySections[this.$section()?.key ?? '']);
    // An entry without an id is a new one
    readonly $editedEntry = signal<NamedEntry | null>(null);

    readonly $googleCalendarParameters = computed(() =>
        toGoogleCalendarParameters(this.systemParameterStore.systemParameters()));

    // The architect whose account is being edited; the dialog is open while it is set
    readonly $editedArchitect = signal<Architect | null>(null);
    // The table keeps its rows during a reload, as opening the dialog reloads the list
    readonly $architectsLoading = computed(() => this.architectStore.architectsNeedRefresh()
        && !this.architectStore.architects().length && !this.architectStore.architectsLoadFailed());
    // The dialog waits while the list loads, so its "Linked to" labels and the unlink button use the current links
    readonly $linkAccountArchitects = computed(() =>
        this.architectStore.architectsNeedRefresh() ? null : this.architectStore.architects());

    constructor() {
        effect(() => {
            let sectionKey = this.$sectionKey();
            if (sectionKey && !this.$section()) {
                this.router.navigate(['/settings', SETTINGS_SECTIONS[0].key], {replaceUrl: true});
            }
        });
        effect(() => {
            if (this.$section()?.showsSystemParameters) {
                // Untracked: the load reads the refresh flag, which would re-run this effect after every load
                untracked(() => {
                    this.systemParameterStore.setSystemParametersNeedRefresh();
                    this.systemParameterStore.loadSystemParameters({});
                });
            }
        });
        effect(() => {
            let namedEntrySection = this.$namedEntrySection();
            untracked(() => {
                // A dialog left open (e.g. by going back in the browser) belongs to the previous section
                this.$editedEntry.set(null);
                // Every visit: the number of projects, contractors... using each entry changes as they are added
                namedEntrySection?.store.loadEntries();
            });
        });
        effect(() => {
            let isArchitectAccounts = this.$section()?.key === 'architect-accounts';
            untracked(() => {
                // A dialog left open (e.g. by going back in the browser) belongs to the previous section
                this.$editedArchitect.set(null);
                if (isArchitectAccounts) {
                    this.architectStore.setArchitectsNeedRefresh();
                    this.architectStore.loadArchitects({});
                }
            });
        });
        effect(() => {
            if (this.$section()?.key === 'google-calendar') {
                // Check again on every visit: the connection depends on Google, not only on the settings
                untracked(() => this.googleCalendarSettingsStore.checkConnection({}));
            }
        });
    }

    onRetry(): void {
        this.systemParameterStore.loadSystemParameters({});
    }

    onEdit(systemParameter: SystemParameter): void {
        this.$editedParameter.set(systemParameter);
    }

    onSave(systemParameter: SystemParameter): void {
        this.systemParameterStore.updateSystemParameter({systemParameter: systemParameter});
        // The report's net values and taxes are calculated with the tax rates
        if (isRateParameter(systemParameter.name)) {
            this.financialReportStore.setReportNeedsRefresh();
            this.dashboardStore.setReportNeedsRefresh();
        }
        this.$editedParameter.set(null);
    }

    onEditClosed(): void {
        this.$editedParameter.set(null);
    }

    onAddEntry(): void {
        this.$editedEntry.set({name: ''});
    }

    onRenameEntry(entry: NamedEntry): void {
        this.$editedEntry.set(entry);
    }

    onSaveEntry(entry: NamedEntry): void {
        this.$namedEntrySection()?.store.saveEntry({entry, afterSave: () => this.$editedEntry.set(null)});
    }

    onEntryEditClosed(): void {
        this.$editedEntry.set(null);
    }

    onDeleteEntry(entry: NamedEntry): void {
        let section = this.$namedEntrySection();
        this.confirmationService.confirm({
            header: `Delete ${section.texts.singular}`,
            message: `Delete ${entry.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                section.store.deleteEntry(entry);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    // Uses the architects this section already loaded: the backend rejects an account taken in the meantime
    onEditArchitectAccount(architect: Architect): void {
        this.$editedArchitect.set(architect);
        this.userStore.loadUsers({});
    }

    loadAccounts(): void {
        this.userStore.loadUsers({});
        this.architectStore.setArchitectsNeedRefresh();
        this.architectStore.loadArchitects({});
    }

    onLinkAccount(userId: number): void {
        let architectId = this.$editedArchitect()!.id!;
        this.architectStore.linkUser({
            architectId: architectId,
            userId: userId,
            afterSave: () => this.closeAccountDialog(architectId),
            // Someone else may have just taken this account, so show the current state
            onError: () => {
                if (this.$editedArchitect()?.id === architectId) {
                    this.loadAccounts();
                }
            }
        });
    }

    onUnlinkAccount(): void {
        let architect = this.$editedArchitect()!;
        this.confirmationService.confirm({
            header: 'Unlink account',
            message: `Unlink the account of ${architectName(architect)}? Their projects and history stay as they are.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Unlink'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.architectStore.unlinkUser({
                    architectId: architect.id!,
                    afterSave: () => this.closeAccountDialog(architect.id!)
                });
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    // A save can finish after its dialog was cancelled and another architect's was opened; that one stays open
    private closeAccountDialog(architectId: number): void {
        if (this.$editedArchitect()?.id === architectId) {
            this.$editedArchitect.set(null);
        }
    }

    onGoogleCalendarSave(systemParameters: SystemParameter[]): void {
        this.googleCalendarSettingsStore.saveParameters(systemParameters);
    }

    onCheckGoogleCalendarConnection(): void {
        this.googleCalendarSettingsStore.checkConnection({});
    }

    onRevokeGoogleCalendarShare(share: CalendarShare): void {
        this.confirmationService.confirm({
            header: 'Revoke access',
            message: `${share.email} will no longer see the calendar in their Google Calendar.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Revoke', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.googleCalendarSettingsStore.removeShare(share.email!);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
