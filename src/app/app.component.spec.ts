import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { AppComponent } from './app.component';
import {provideTestDependencies} from '../testing/test-providers';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {of} from 'rxjs';
import {AuthorizationService} from './security/authorization.service';
import {UserStore} from './shared/user/state';
import {ThemeService} from './theme/theme.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: provideTestDependencies()
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Task-FE'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Task-FE');
  });

  it('should show only the avatar in the top bar and name the user for screen readers', () => {
    spyOn(TestBed.inject(AuthorizationService), 'isAuthenticated').and.returnValue(of(true));
    patchState(unprotected(TestBed.inject(UserStore)), {currentUser: {username: 'Maria Kowalska'}});
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const trigger: HTMLElement = fixture.nativeElement.querySelector('button[aria-haspopup="menu"]');
    expect(trigger.getAttribute('aria-label')).toBe('Maria Kowalska, open account menu');
    expect(trigger.textContent).not.toContain('Maria Kowalska');
    expect(trigger.querySelector('.pi-chevron-down')).toBeNull();
  });

  // PrimeNG 21 handles a dialog's Escape outside Angular's zone; the app redraws right after it
  it('should redraw after Escape so a dialog closed with it disappears', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const redraw = spyOn(TestBed.inject(ApplicationRef), 'tick');

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(redraw).not.toHaveBeenCalled();
    tick();

    expect(redraw).toHaveBeenCalled();
    fixture.destroy();
  }));

  it('should keep focus in a dialog that is still open when the one over it closes', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const openDialog = document.createElement('div');
    openDialog.className = 'p-dialog';
    const dialogButton = document.createElement('button');
    openDialog.appendChild(dialogButton);
    const closingMask = document.createElement('div');
    closingMask.className = 'p-dialog-mask';
    document.body.append(openDialog, closingMask);

    closingMask.remove();
    await new Promise(resolve => setTimeout(resolve));
    await new Promise(resolve => setTimeout(resolve));

    expect(document.activeElement).toBe(dialogButton);
    openDialog.remove();
    fixture.destroy();
  });

  describe('user menu dark theme item', () => {
    let fixture: ComponentFixture<AppComponent>;
    let themeService: ThemeService;

    beforeEach(async () => {
      spyOn(TestBed.inject(AuthorizationService), 'isAuthenticated').and.returnValue(of(true));
      themeService = TestBed.inject(ThemeService);
      themeService.setMode('light');
      fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      fixture.nativeElement.querySelector('button[aria-haspopup="menu"]').click();
      await settle();
    });

    afterEach(() => {
      fixture.destroy();
      themeService.setMode('light');
    });

    async function settle(): Promise<void> {
      fixture.detectChanges();
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      fixture.detectChanges();
    }

    function menuList(): HTMLElement {
      return document.querySelector('.p-menu-overlay [role="menu"]') as HTMLElement;
    }

    function darkThemeItem(): HTMLElement {
      return document.getElementById('dark-theme') as HTMLElement;
    }

    function menuOpen(): boolean {
      return fixture.componentInstance.userMenu.visible === true;
    }

    function press(code: string): void {
      menuList().dispatchEvent(new KeyboardEvent('keydown', {code, key: code, bubbles: true}));
    }

    it('should toggle the theme on click and keep the menu open', async () => {
      expect(darkThemeItem().getAttribute('aria-label')).toBe('Dark theme, off');

      (darkThemeItem().querySelector('a') as HTMLElement).click();
      await settle();

      expect(themeService.$mode()).toBe('dark');
      expect(menuOpen()).toBeTrue();
      expect(darkThemeItem().getAttribute('aria-label')).toBe('Dark theme, on');
      expect(darkThemeItem().querySelector('.app-switch')?.classList).toContain('app-switch-on');
    });

    // Keeps the row, so the switch slides instead of being drawn again in its new place
    it('should keep the same row when the theme changes', async () => {
      const row = darkThemeItem();

      (row.querySelector('a') as HTMLElement).click();
      await settle();

      expect(darkThemeItem()).toBe(row);
    });

    // PrimeNG moves focus to the avatar before clicking the item; this checks the item takes it back
    it('should toggle the theme with Enter and keep the keyboard in the menu', async () => {
      menuList().focus();
      press('ArrowDown');
      await settle();
      expect(menuList().getAttribute('aria-activedescendant')).toBe('dark-theme');

      press('Enter');
      await settle();

      expect(themeService.$mode()).toBe('dark');
      expect(menuOpen()).toBeTrue();
      expect(document.activeElement).toBe(menuList());
      expect(menuList().getAttribute('aria-activedescendant')).toBe('dark-theme');

      press('Enter');
      await settle();

      expect(themeService.$mode()).toBe('light');
      expect(menuOpen()).toBeTrue();
    });

    it('should still close the menu after the other items', async () => {
      spyOn(fixture.componentInstance.releaseNoteStore, 'openHistory');
      const whatsNew = Array.from(document.querySelectorAll<HTMLElement>('.p-menu-overlay [role="menuitem"]'))
        .find(item => item.getAttribute('aria-label') === "What's new") as HTMLElement;

      (whatsNew.querySelector('a') as HTMLElement).click();
      await settle();

      expect(fixture.componentInstance.releaseNoteStore.openHistory).toHaveBeenCalled();
      expect(menuOpen()).toBeFalse();
    });
  });
});
