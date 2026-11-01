import {ChangeDetectionStrategy, Component, computed, effect, inject, Signal, signal, untracked} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {PageCrumb, PageHeaderComponent} from "../../shared";
import {SystemParameter} from "../../generated/models/system-parameter";
import {
    ContractorCategoryStore,
    GoogleCalendarSettingsStore,
    ProjectTypeStore,
    SupplierCategoryStore,
    SystemParameterStore
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
    NamedEntry,
    NamedEntryTexts,
    PROJECT_TYPE_TEXTS,
    SUPPLIER_CATEGORY_TEXTS
} from "../named-entry";
import {ButtonModule} from "primeng/button";

// What the shell needs from the store of one list of named entries (project types, contractor categories...)
interface NamedEntrySection {
    texts: NamedEntryTexts;
    $entries: Signal<NamedEntry[]>;
    $loading: Signal<boolean>;
    $loadFailed: Signal<boolean>;
    $saving: Signal<boolean>;
    $deleting: Signal<number | null>;
    load(): void;
    // afterSave runs only when the save worked
    save(entry: NamedEntry, afterSave: () => void): void;
    delete(entry: NamedEntry): void;
}

@Component({
    selector: 'settings-shell',
    templateUrl: './settings-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, SystemParameterListComponent, EditSystemParameterComponent,
        AppearanceSettingsComponent, GoogleCalendarSettingsComponent, GoogleCalendarSharesComponent, ConfirmDialogModule,
        RouterLink, RouterLinkActive, NamedEntryListComponent, EditNamedEntryComponent, ButtonModule]
})
export class SettingsShellComponent {
    readonly systemParameterStore = inject(SystemParameterStore);
    readonly googleCalendarSettingsStore = inject(GoogleCalendarSettingsStore);
    private readonly projectTypeStore = inject(ProjectTypeStore);
    private readonly contractorCategoryStore = inject(ContractorCategoryStore);
    private readonly supplierCategoryStore = inject(SupplierCategoryStore);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly confirmationService = inject(ConfirmationService);

    protected readonly GoogleCalendarConnectionStatus = GoogleCalendarConnectionStatus;

    readonly sectionGroups = SETTINGS_SECTION_GROUPS;

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
        'project-types': {
            texts: PROJECT_TYPE_TEXTS,
            $entries: computed(() => this.projectTypeStore.projectTypes()
                .map(type => ({id: type.id, name: type.name, usageCount: type.numberOfProjects}))),
            $loading: computed(() => !this.projectTypeStore.projectTypesLoaded()
                && !this.projectTypeStore.projectTypesLoadFailed()),
            $loadFailed: this.projectTypeStore.projectTypesLoadFailed,
            $saving: this.projectTypeStore.projectTypeSaving,
            $deleting: this.projectTypeStore.projectTypeDeleting,
            load: () => this.projectTypeStore.loadProjectTypes(),
            save: (entry, afterSave) => this.projectTypeStore.saveProjectType({projectType: entry, afterSave}),
            delete: entry => this.projectTypeStore.deleteProjectType(entry),
        },
        'contractor-categories': {
            texts: CONTRACTOR_CATEGORY_TEXTS,
            $entries: computed(() => this.contractorCategoryStore.contractorCategories()
                .map(category => ({
                    id: category.id, name: category.name, usageCount: category.numberOfContractors
                }))),
            $loading: computed(() => !this.contractorCategoryStore.contractorCategoriesLoaded()
                && !this.contractorCategoryStore.contractorCategoriesLoadFailed()),
            $loadFailed: this.contractorCategoryStore.contractorCategoriesLoadFailed,
            $saving: this.contractorCategoryStore.contractorCategorySaving,
            $deleting: this.contractorCategoryStore.contractorCategoryDeleting,
            load: () => this.contractorCategoryStore.loadContractorCategories(),
            save: (entry, afterSave) =>
                this.contractorCategoryStore.saveContractorCategory({contractorCategory: entry, afterSave}),
            delete: entry => this.contractorCategoryStore.deleteContractorCategory(entry),
        },
        'supplier-categories': {
            texts: SUPPLIER_CATEGORY_TEXTS,
            $entries: computed(() => this.supplierCategoryStore.supplierCategories()
                .map(category => ({id: category.id, name: category.name, usageCount: category.numberOfSuppliers}))),
            $loading: computed(() => !this.supplierCategoryStore.supplierCategoriesLoaded()
                && !this.supplierCategoryStore.supplierCategoriesLoadFailed()),
            $loadFailed: this.supplierCategoryStore.supplierCategoriesLoadFailed,
            $saving: this.supplierCategoryStore.supplierCategorySaving,
            $deleting: this.supplierCategoryStore.supplierCategoryDeleting,
            load: () => this.supplierCategoryStore.loadSupplierCategories(),
            save: (entry, afterSave) =>
                this.supplierCategoryStore.saveSupplierCategory({supplierCategory: entry, afterSave}),
            delete: entry => this.supplierCategoryStore.deleteSupplierCategory(entry),
        },
    };
    readonly $namedEntrySection = computed(() => this.namedEntrySections[this.$section()?.key ?? '']);
    // An entry without an id is a new one
    readonly $editedEntry = signal<NamedEntry | null>(null);

    readonly $googleCalendarParameters = computed(() =>
        toGoogleCalendarParameters(this.systemParameterStore.systemParameters()));

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
                namedEntrySection?.load();
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
        this.$namedEntrySection()?.save(entry, () => this.$editedEntry.set(null));
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
                section.delete(entry);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
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
