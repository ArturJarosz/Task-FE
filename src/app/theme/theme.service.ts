import {effect, inject, Injectable, signal, untracked, DOCUMENT} from '@angular/core';
import {SystemParameterStore} from '../settings/state';
import {UserStore} from '../shared/user/state';
import {ThemeMode as ThemeModeDto} from '../generated/models/theme-mode';
import {UserConfigurationName} from '../generated/models/user-configuration-name';
import {
    BRAND_SHADES,
    brandPalette,
    contrastTextColor,
    DEFAULT_BRAND_COLOR,
    isHexColor,
    normalizeHexColor,
    THEME_COLOR_PARAMETER
} from './theme-colors';

export type ThemeMode = 'light' | 'dark';

export const DARK_MODE_CLASS = 'app-dark';
// Copy of the user's saved mode, so the next start paints it before the user's settings load
const MODE_STORAGE_KEY = 'task.theme.mode';
// Id of the user that copy belongs to, so another user logging in on this browser doesn't inherit it
const MODE_USER_STORAGE_KEY = 'task.theme.modeUser';
// Last brand color from the server, so the next start paints it before the system parameters load
const BRAND_COLOR_STORAGE_KEY = 'task.theme.brandColor';

/**
 * Applies the light/dark mode (the THEME_MODE user configuration, saved per user) and the brand color (the
 * "Theme color" system parameter, the same for everyone). Both work through CSS variables on <html>, see styles.css.
 */
@Injectable({providedIn: 'root'})
export class ThemeService {
    private readonly document = inject(DOCUMENT);
    private readonly systemParameterStore = inject(SystemParameterStore);
    private readonly userStore = inject(UserStore);

    readonly $mode = signal<ThemeMode>('light');
    // Saved brand color; a preview may show another one until it is saved or reset
    readonly $brandColor = signal(DEFAULT_BRAND_COLOR);
    // What is painted right now (including a preview); charts copy colors, so they rebuild when this changes
    readonly $appliedColors = signal({mode: 'light' as ThemeMode, brandColor: DEFAULT_BRAND_COLOR},
        {equal: (a, b) => a.mode === b.mode && a.brandColor === b.brandColor});

    // Set once the user picks a mode in this session; their pick then wins over settings that load after it
    private modeChosenHere = false;

    constructor() {
        effect(() => {
            let themeColor = this.systemParameterStore.systemParameters()
                .find(parameter => parameter.name === THEME_COLOR_PARAMETER)?.value;
            if (isHexColor(themeColor)) {
                this.setBrandColor(themeColor);
            }
        });
        effect(() => {
            let user = this.userStore.currentUser();
            let configurations = this.userStore.configurations();
            if (!user?.id || configurations === null) {
                return;
            }
            let themeMode = configurations.find(configuration => configuration.name === UserConfigurationName.THEME_MODE);
            let savedMode: ThemeMode | null = themeMode?.value
                ? (themeMode.value === ThemeModeDto.DARK ? 'dark' : 'light')
                : null;
            let userId = String(user.id);
            untracked(() => {
                if (this.modeChosenHere) {
                    // Settings that loaded after the pick (or before the user was known) are stale: save the pick
                    if (savedMode !== this.$mode()) {
                        this.saveMode(this.$mode());
                    }
                } else if (savedMode) {
                    this.applyMode(savedMode);
                } else if (this.readStorage(MODE_USER_STORAGE_KEY) === userId) {
                    // Nothing saved for the user yet: keep the mode this browser shows, if it was this user's
                    this.saveMode(this.$mode());
                } else {
                    this.applyMode('light');
                }
            });
        });
    }

    // Runs before the first render, so the page never flashes the default theme
    init(): void {
        this.applyMode(this.readStorage(MODE_STORAGE_KEY) === 'dark' ? 'dark' : 'light');
        let cachedBrandColor = this.readStorage(BRAND_COLOR_STORAGE_KEY);
        this.setBrandColor(isHexColor(cachedBrandColor) ? cachedBrandColor : DEFAULT_BRAND_COLOR);
    }

    // Applies the mode at once and saves it for the current user, so it follows them to other browsers
    setMode(mode: ThemeMode): void {
        this.modeChosenHere = true;
        this.applyMode(mode);
        this.saveMode(mode);
    }

    setBrandColor(color: string): void {
        let brandColor = normalizeHexColor(color);
        this.$brandColor.set(brandColor);
        this.applyBrandColor(brandColor);
        this.writeStorage(BRAND_COLOR_STORAGE_KEY, brandColor);
    }

    // Shows a color everywhere without saving it; resetPreview() goes back to the saved one
    previewBrandColor(color: string): void {
        if (isHexColor(normalizeHexColor(color))) {
            this.applyBrandColor(normalizeHexColor(color));
        }
    }

    resetPreview(): void {
        this.applyBrandColor(this.$brandColor());
    }

    private applyMode(mode: ThemeMode): void {
        this.$mode.set(mode);
        this.document.documentElement.classList.toggle(DARK_MODE_CLASS, mode === 'dark');
        this.writeStorage(MODE_STORAGE_KEY, mode);
        let userId = this.userStore.currentUser()?.id;
        if (userId) {
            this.writeStorage(MODE_USER_STORAGE_KEY, String(userId));
        }
        this.$appliedColors.update(colors => ({...colors, mode}));
    }

    // Before the current user loads (or when they have no account record yet) the mode stays in this browser only
    private saveMode(mode: ThemeMode): void {
        if (this.userStore.currentUser()?.id) {
            this.userStore.updateConfiguration({
                name: UserConfigurationName.THEME_MODE,
                value: mode === 'dark' ? ThemeModeDto.DARK : ThemeModeDto.LIGHT
            });
        }
    }

    private applyBrandColor(color: string): void {
        let style = this.document.documentElement.style;
        // The default keeps the hand-tuned TailAdmin shades from styles.css
        if (color === DEFAULT_BRAND_COLOR) {
            BRAND_SHADES.forEach(shade => style.removeProperty(`--app-brand-${shade}`));
            style.removeProperty('--app-brand-contrast');
        } else {
            let shades = brandPalette(color);
            BRAND_SHADES.forEach(shade => style.setProperty(`--app-brand-${shade}`, shades[shade]));
            style.setProperty('--app-brand-contrast', contrastTextColor(color));
        }
        this.$appliedColors.update(colors => ({...colors, brandColor: color}));
    }

    // Storage may be unavailable (private mode, blocked site data); the theme then just isn't remembered
    private readStorage(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    private writeStorage(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch {
            // not remembered, see readStorage
        }
    }
}
