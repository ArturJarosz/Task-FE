import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ActivatedRoute, convertToParamMap, ParamMap} from '@angular/router';
import {of} from 'rxjs';

import {AuthorizationService} from '../authorization.service';
import {NotLoggedInComponent} from './not-logged-in.component';

describe('NotLoggedInComponent', () => {
    let component: NotLoggedInComponent;
    let fixture: ComponentFixture<NotLoggedInComponent>;
    let authorizationService: jasmine.SpyObj<AuthorizationService>;
    let route: { snapshot: { queryParamMap: ParamMap } };

    beforeEach(async () => {
        authorizationService = jasmine.createSpyObj<AuthorizationService>('AuthorizationService', ['login', 'logout', 'isAuthenticated', 'getUser']);
        authorizationService.isAuthenticated.and.returnValue(of(false));
        route = {snapshot: {queryParamMap: convertToParamMap({})}};

        await TestBed.configureTestingModule({
            imports: [NotLoggedInComponent],
            providers: [
                {provide: AuthorizationService, useValue: authorizationService},
                {provide: ActivatedRoute, useValue: route}
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(NotLoggedInComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should log in after the countdown', fakeAsync(() => {
        fixture.detectChanges();

        tick(1000);
        expect(component.secondsLeft()).toBe(2);
        expect(authorizationService.login).not.toHaveBeenCalled();

        tick(2000);
        expect(authorizationService.login).toHaveBeenCalledTimes(1);
    }));

    it('should not count down when the user is authenticated', fakeAsync(() => {
        authorizationService.isAuthenticated.and.returnValue(of(true));
        fixture = TestBed.createComponent(NotLoggedInComponent);
        fixture.detectChanges();

        tick(5000);
        expect(authorizationService.login).not.toHaveBeenCalled();
    }));

    it('should say the session expired when sent here after an expired session', () => {
        route.snapshot.queryParamMap = convertToParamMap({reason: 'expired'});
        fixture = TestBed.createComponent(NotLoggedInComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.sessionExpired).toBe(true);
        expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Your session has expired');
    });

    it('should log in when the button is clicked', () => {
        fixture.detectChanges();

        fixture.debugElement.query(By.css('p-button button')).nativeElement.click();

        expect(authorizationService.login).toHaveBeenCalledTimes(1);
    });
});
