import {ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {PageCrumb, PageHeaderComponent} from "../../shared";
import {SystemParameter} from "../../generated/models/system-parameter";
import {GoogleCalendarSettingsStore, ProjectTypeStore, SystemParameterStore} from "../state";
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
import {ProjectTypeListComponent} from "../project-type-list/project-type-list.component";
import {EditProjectTypeComponent} from "../edit-project-type/edit-project-type.component";
import {ProjectType} from "../../generated/models/project-type";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'settings-shell',
    templateUrl: './settings-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, SystemParameterListComponent, EditSystemParameterComponent,
        AppearanceSettingsComponent, GoogleCalendarSettingsComponent, GoogleCalendarSharesComponent, ConfirmDialogModule,
        RouterLink, RouterLinkActive, ProjectTypeListComponent, EditProjectTypeComponent, ButtonModule]
})
export class SettingsShellComponent {
    readonly systemParameterStore = inject(SystemParameterStore);
    readonly googleCalendarSettingsStore = inject(GoogleCalendarSettingsStore);
    readonly projectTypeStore = inject(ProjectTypeStore);
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
    // A project type without an id is a new one
    readonly $editedProjectType = signal<ProjectType | null>(null);

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
            if (this.$section()?.key === 'project-types') {
                // Every visit: the number of projects of each type changes as projects are added
                untracked(() => this.projectTypeStore.loadProjectTypes());
            }
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

    onAddProjectType(): void {
        this.$editedProjectType.set({name: ''});
    }

    onRenameProjectType(projectType: ProjectType): void {
        this.$editedProjectType.set(projectType);
    }

    onSaveProjectType(projectType: ProjectType): void {
        this.projectTypeStore.saveProjectType({projectType, afterSave: () => this.$editedProjectType.set(null)});
    }

    onProjectTypeEditClosed(): void {
        this.$editedProjectType.set(null);
    }

    onDeleteProjectType(projectType: ProjectType): void {
        this.confirmationService.confirm({
            header: 'Delete project type',
            message: `Delete ${projectType.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.projectTypeStore.deleteProjectType(projectType);
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
