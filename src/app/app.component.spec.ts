import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { AppComponent } from './app.component';
import {provideTestDependencies} from '../testing/test-providers';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {of} from 'rxjs';
import {AuthorizationService} from './security/authorization.service';
import {UserStore} from './shared/user/state';

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
});
