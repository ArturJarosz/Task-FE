import {
    ChangeDetectionStrategy,
    Component,
    computed,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    signal,
    SimpleChanges
} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {ColorPickerModule} from "primeng/colorpicker";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent} from "../../shared";
import {SystemParameter} from "../../generated/models/system-parameter";
import {ThemeService} from "../../theme/theme.service";
import {DEFAULT_BRAND_COLOR, isHexColor, isLowContrastBrandColor, normalizeHexColor} from "../../theme/theme-colors";

@Component({
    selector: 'appearance-settings',
    templateUrl: './appearance-settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, ToggleSwitchModule, ColorPickerModule, InputTextModule, ButtonModule, TagModule,
        SkeletonModule, TooltipModule, EmptyStateComponent]
})
export class AppearanceSettingsComponent implements OnChanges, OnDestroy {
    private readonly themeService = inject(ThemeService);

    // The "Theme color" system parameter
    @Input()
    themeColorParameter: SystemParameter | undefined;
    @Input()
    loading = false;
    @Input()
    loadFailed = false;

    @Output()
    saveThemeColor = new EventEmitter<SystemParameter>();
    @Output()
    retry = new EventEmitter<void>();

    readonly $darkMode = computed(() => this.themeService.$mode() === 'dark');

    // What the user typed or picked; shown across the app as a preview until saved or cancelled
    readonly $draftColor = signal('');
    private readonly $savedColor = signal(DEFAULT_BRAND_COLOR);

    readonly $draftValid = computed(() => isHexColor(normalizeHexColor(this.$draftColor())));
    // The picker only takes complete colors; while the text is half typed it keeps the last valid one
    readonly $pickerColor = computed(() =>
        this.$draftValid() ? normalizeHexColor(this.$draftColor()) : this.$savedColor());
    readonly $changed = computed(() => this.$draftValid() && this.$pickerColor() !== this.$savedColor());
    // Brand-500 is used for links and icons on cards, so a very light color would be hard to read
    readonly $lowContrast = computed(() => isLowContrastBrandColor(this.$pickerColor()));

    get defaultColor(): string {
        return this.themeColorParameter?.defaultValue ?? DEFAULT_BRAND_COLOR;
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Only a newly loaded or saved parameter replaces the draft; a reload flag must not drop what was typed
        if (!changes['themeColorParameter']) {
            return;
        }
        let saved = isHexColor(this.themeColorParameter?.value) ? this.themeColorParameter!.value! : DEFAULT_BRAND_COLOR;
        this.$savedColor.set(normalizeHexColor(saved));
        this.$draftColor.set(normalizeHexColor(saved));
        this.themeService.resetPreview();
    }

    ngOnDestroy(): void {
        this.themeService.resetPreview();
    }

    onDarkModeChange(dark: boolean): void {
        this.themeService.setMode(dark ? 'dark' : 'light');
    }

    onDraftChange(value: string): void {
        this.$draftColor.set(value);
        if (this.$draftValid()) {
            this.themeService.previewBrandColor(value);
        }
    }

    onResetToDefault(): void {
        this.onDraftChange(this.defaultColor);
    }

    onCancel(): void {
        this.$draftColor.set(this.$savedColor());
        this.themeService.resetPreview();
    }

    onSave(): void {
        if (!this.$changed() || !this.themeColorParameter) {
            return;
        }
        this.saveThemeColor.emit({...this.themeColorParameter, value: this.$pickerColor()});
    }
}
