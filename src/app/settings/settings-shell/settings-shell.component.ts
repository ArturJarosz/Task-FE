import {ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";
import {PageCrumb, PageHeaderComponent} from "../../shared";
import {SystemParameter} from "../../generated/models/system-parameter";
import {SystemParameterStore} from "../state";
import {EditSystemParameterComponent} from "../edit-system-parameter/edit-system-parameter.component";
import {SystemParameterListComponent} from "../system-parameter-list/system-parameter-list.component";
import {AppearanceSettingsComponent} from "../appearance-settings/appearance-settings.component";
import {THEME_COLOR_PARAMETER} from "../../theme/theme-colors";
import {SETTINGS_SECTION_GROUPS, SETTINGS_SECTIONS} from "./settings-sections";

@Component({
    selector: 'settings-shell',
    templateUrl: './settings-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, SystemParameterListComponent, EditSystemParameterComponent,
        AppearanceSettingsComponent, RouterLink, RouterLinkActive]
})
export class SettingsShellComponent {
    readonly systemParameterStore = inject(SystemParameterStore);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly sectionGroups = SETTINGS_SECTION_GROUPS;

    private readonly $sectionKey = toSignal(this.route.paramMap.pipe(map(params => params.get('section'))));
    readonly $section = computed(() => SETTINGS_SECTIONS.find(section => section.key === this.$sectionKey()));
    readonly $crumbs = computed<PageCrumb[]>(() => [
        {label: 'Home', route: ['/home']},
        {label: 'Settings', route: ['/settings']},
        {label: this.$section()?.label ?? ''},
    ]);

    // The theme color has its own editor under Appearance
    readonly $systemParameters = computed(() => this.systemParameterStore.systemParameters()
        .filter(parameter => parameter.name !== THEME_COLOR_PARAMETER));
    readonly $themeColorParameter = computed(() => this.systemParameterStore.systemParameters()
        .find(parameter => parameter.name === THEME_COLOR_PARAMETER));
    readonly $loading = this.systemParameterStore.systemParametersNeedRefresh;
    readonly $loadFailed = this.systemParameterStore.systemParametersLoadFailed;
    readonly $editedParameter = signal<SystemParameter | null>(null);

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
}
