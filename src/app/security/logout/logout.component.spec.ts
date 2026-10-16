import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {AuthorizationService} from '../authorization.service';
import {LogoutComponent} from './logout.component';

describe('LogoutComponent', () => {
    let component: LogoutComponent;
    let fixture: ComponentFixture<LogoutComponent>;
    let authorizationService: jasmine.SpyObj<AuthorizationService>;

    beforeEach(async () => {
        authorizationService = jasmine.createSpyObj<AuthorizationService>('AuthorizationService', ['login', 'logout', 'isAuthenticated', 'getUser']);

        await TestBed.configureTestingModule({
            imports: [LogoutComponent],
            providers: [{provide: AuthorizationService, useValue: authorizationService}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LogoutComponent);
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

    it('should log in when the button is clicked', () => {
        fixture.detectChanges();

        fixture.debugElement.query(By.css('p-button button')).nativeElement.click();

        expect(authorizationService.login).toHaveBeenCalledTimes(1);
    });
});
