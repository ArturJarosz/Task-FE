import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AppearanceSettingsComponent} from './appearance-settings.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {SystemParameter} from '../../generated/models/system-parameter';
import {ThemeService} from '../../theme/theme.service';

describe('AppearanceSettingsComponent', () => {
    let component: AppearanceSettingsComponent;
    let fixture: ComponentFixture<AppearanceSettingsComponent>;
    let themeService: ThemeService;

    const themeColor: SystemParameter = {id: 3, name: 'Theme color', type: 'TEXT', value: '#465fff', defaultValue: '#465fff'};

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppearanceSettingsComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        themeService = TestBed.inject(ThemeService);
        fixture = TestBed.createComponent(AppearanceSettingsComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('themeColorParameter', themeColor);
        fixture.detectChanges();
    });

    afterEach(() => {
        themeService.setMode('light');
        themeService.setBrandColor('#465fff');
    });

    it('should switch the theme to dark', () => {
        component.onDarkModeChange(true);

        expect(themeService.$mode()).toBe('dark');
        expect(component.$darkMode()).toBeTrue();
    });

    it('should preview a valid color and save it normalized', () => {
        let saved: SystemParameter | undefined;
        component.saveThemeColor.subscribe(parameter => saved = parameter);

        component.onDraftChange('0F766E');
        expect(document.documentElement.style.getPropertyValue('--app-brand-500')).toBe('#0f766e');

        component.onSave();
        expect(saved).toEqual({...themeColor, value: '#0f766e'});
    });

    it('should not save an incomplete color', () => {
        let saveSpy = jasmine.createSpy('save');
        component.saveThemeColor.subscribe(saveSpy);

        component.onDraftChange('#0f7');
        component.onSave();

        expect(component.$draftValid()).toBeFalse();
        expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should warn about a color too light for text on white', () => {
        component.onDraftChange('#fde047');

        expect(component.$lowContrast()).toBeTrue();
    });

    it('should drop the preview on cancel', () => {
        component.onDraftChange('#dc2626');
        component.onCancel();

        expect(component.$draftColor()).toBe('#465fff');
        expect(component.$changed()).toBeFalse();
        expect(document.documentElement.style.getPropertyValue('--app-brand-500')).toBe('');
    });

    it('should offer the default color as reset', () => {
        fixture.componentRef.setInput('themeColorParameter', {...themeColor, value: '#0f766e'});
        fixture.detectChanges();

        component.onResetToDefault();

        expect(component.$pickerColor()).toBe('#465fff');
        expect(component.$changed()).toBeTrue();
    });
});
