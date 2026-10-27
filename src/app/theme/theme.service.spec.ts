import {TestBed} from '@angular/core/testing';

import {DARK_MODE_CLASS, ThemeService} from './theme.service';
import {provideTestDependencies} from '../../testing/test-providers';
import {SystemParameterStore} from '../settings/state';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {UserStore} from '../shared/user/state';
import {ThemeMode} from '../generated/models/theme-mode';
import {User} from '../generated/models/user';
import {UserConfiguration} from '../generated/models/user-configuration';
import {UserConfigurationName} from '../generated/models/user-configuration-name';

describe('ThemeService', () => {
    let service: ThemeService;
    let root: HTMLElement;
    let httpTesting: HttpTestingController;

    const THEME_MODE_URL = '/users/current/configurations/THEME_MODE';
    const loadUser = (user: User, configurations: UserConfiguration[] = []) => {
        patchState(unprotected(TestBed.inject(UserStore)), {currentUser: user, configurations: configurations});
        TestBed.flushEffects();
    };
    const themeMode = (value: ThemeMode): UserConfiguration => ({name: UserConfigurationName.THEME_MODE, value});

    beforeEach(() => {
        localStorage.removeItem('task.theme.mode');
        localStorage.removeItem('task.theme.modeUser');
        localStorage.removeItem('task.theme.brandColor');
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        service = TestBed.inject(ThemeService);
        root = document.documentElement;
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
        patchState(unprotected(TestBed.inject(UserStore)), {currentUser: null, configurations: null});
        service.setMode('light');
        service.setBrandColor('#415cc8');
        localStorage.removeItem('task.theme.mode');
        localStorage.removeItem('task.theme.modeUser');
        localStorage.removeItem('task.theme.brandColor');
    });

    it('should start in light mode with the default brand color when nothing is stored', () => {
        service.init();

        expect(service.$mode()).toBe('light');
        expect(root.classList).not.toContain(DARK_MODE_CLASS);
        expect(root.style.getPropertyValue('--app-brand-500')).toBe('');
    });

    it('should restore the stored mode and brand color', () => {
        localStorage.setItem('task.theme.mode', 'dark');
        localStorage.setItem('task.theme.brandColor', '#0f766e');

        service.init();

        expect(root.classList).toContain(DARK_MODE_CLASS);
        expect(root.style.getPropertyValue('--app-brand-500')).toBe('#0f766e');
    });

    it('should switch to dark mode and keep it in this browser while no user is loaded', () => {
        service.setMode('dark');

        expect(root.classList).toContain(DARK_MODE_CLASS);
        expect(localStorage.getItem('task.theme.mode')).toBe('dark');
        httpTesting.expectNone(request => request.url.endsWith(THEME_MODE_URL));
    });

    it('should save the mode as the THEME_MODE configuration of the current user', () => {
        loadUser({id: 7, username: 'anna'}, [themeMode(ThemeMode.LIGHT)]);

        service.setMode('dark');

        let request = httpTesting.expectOne(request => request.url.endsWith(THEME_MODE_URL));
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual(themeMode(ThemeMode.DARK));
        request.flush(themeMode(ThemeMode.DARK));
        expect(TestBed.inject(UserStore).configurations()).toEqual([themeMode(ThemeMode.DARK)]);
    });

    it('should apply the mode saved for the user when their settings load', () => {
        service.init();

        loadUser({id: 7, username: 'anna'}, [themeMode(ThemeMode.DARK)]);

        expect(service.$mode()).toBe('dark');
        expect(root.classList).toContain(DARK_MODE_CLASS);
        expect(localStorage.getItem('task.theme.mode')).toBe('dark');
        httpTesting.expectNone(request => request.url.endsWith(THEME_MODE_URL));
    });

    it('should save the browser mode for a user who has none saved yet', () => {
        localStorage.setItem('task.theme.mode', 'dark');
        localStorage.setItem('task.theme.modeUser', '7');
        service.init();

        loadUser({id: 7, username: 'anna'}, []);

        httpTesting.expectOne(request => request.url.endsWith(THEME_MODE_URL)).flush(themeMode(ThemeMode.DARK));
        expect(service.$mode()).toBe('dark');
    });

    it('should not hand the browser mode of another user to a user who has none saved', () => {
        localStorage.setItem('task.theme.mode', 'dark');
        localStorage.setItem('task.theme.modeUser', '3');
        service.init();

        loadUser({id: 7, username: 'anna'}, []);

        expect(service.$mode()).toBe('light');
        expect(root.classList).not.toContain(DARK_MODE_CLASS);
        expect(localStorage.getItem('task.theme.modeUser')).toBe('7');
        httpTesting.expectNone(request => request.url.endsWith(THEME_MODE_URL));
    });

    it('should keep a mode picked before the user settings load and save it over them', () => {
        patchState(unprotected(TestBed.inject(UserStore)), {currentUser: {id: 7, username: 'anna'}, configurations: null});
        TestBed.flushEffects();
        service.setMode('dark');
        httpTesting.expectOne(request => request.url.endsWith(THEME_MODE_URL)).flush(themeMode(ThemeMode.DARK));

        // The settings request was sent before the pick, so it still says LIGHT
        loadUser({id: 7, username: 'anna'}, [themeMode(ThemeMode.LIGHT)]);

        expect(service.$mode()).toBe('dark');
        expect(root.classList).toContain(DARK_MODE_CLASS);
        let request = httpTesting.expectOne(request => request.url.endsWith(THEME_MODE_URL));
        expect(request.request.body).toEqual(themeMode(ThemeMode.DARK));
        request.flush(themeMode(ThemeMode.DARK));
    });

    it('should wait for the user settings before saving the browser mode', () => {
        patchState(unprotected(TestBed.inject(UserStore)), {currentUser: {id: 7, username: 'anna'}, configurations: null});
        TestBed.flushEffects();

        httpTesting.expectNone(request => request.url.endsWith(THEME_MODE_URL));
    });

    it('should not save the mode for a user without an account record', () => {
        loadUser({});

        service.setMode('dark');

        httpTesting.expectNone(request => request.url.endsWith(THEME_MODE_URL));
    });

    it('should write the brand palette and a readable text color', () => {
        service.setBrandColor('#FDE047');

        expect(root.style.getPropertyValue('--app-brand-500')).toBe('#fde047');
        expect(root.style.getPropertyValue('--app-brand-50')).not.toBe('');
        expect(root.style.getPropertyValue('--app-brand-contrast')).toBe('#101828');
        expect(localStorage.getItem('task.theme.brandColor')).toBe('#fde047');
    });

    it('should go back to the stylesheet shades for the default color', () => {
        service.setBrandColor('#0f766e');
        service.setBrandColor('#415cc8');

        expect(root.style.getPropertyValue('--app-brand-500')).toBe('');
        expect(root.style.getPropertyValue('--app-brand-contrast')).toBe('');
    });

    it('should preview a color without saving it and reset to the saved one', () => {
        service.setBrandColor('#0f766e');

        service.previewBrandColor('#dc2626');
        expect(root.style.getPropertyValue('--app-brand-500')).toBe('#dc2626');
        expect(service.$brandColor()).toBe('#0f766e');

        service.resetPreview();
        expect(root.style.getPropertyValue('--app-brand-500')).toBe('#0f766e');
    });

    it('should report the painted colors so charts can rebuild', () => {
        service.setMode('dark');
        service.previewBrandColor('#dc2626');

        expect(service.$appliedColors()).toEqual({mode: 'dark', brandColor: '#dc2626'});

        service.resetPreview();
        expect(service.$appliedColors().brandColor).toBe('#415cc8');
    });

    it('should apply the theme color system parameter once it loads', () => {
        let store = TestBed.inject(SystemParameterStore);
        patchState(unprotected(store), {
            systemParameters: [{id: 3, name: 'Theme color', type: 'TEXT', value: '#7c3aed', defaultValue: '#415cc8'}]
        });
        TestBed.flushEffects();

        expect(service.$brandColor()).toBe('#7c3aed');
        expect(root.style.getPropertyValue('--app-brand-500')).toBe('#7c3aed');
    });
});
