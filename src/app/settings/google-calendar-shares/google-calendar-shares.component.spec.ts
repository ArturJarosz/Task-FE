import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GoogleCalendarSharesComponent} from './google-calendar-shares.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {CalendarShare} from '../../generated/models/calendar-share';
import {CalendarShareRole} from '../../generated/models/calendar-share-role';

describe('GoogleCalendarSharesComponent', () => {
    let fixture: ComponentFixture<GoogleCalendarSharesComponent>;
    let component: GoogleCalendarSharesComponent;
    let added: CalendarShare | undefined;
    let revoked: CalendarShare | undefined;

    const reader: CalendarShare = {email: 'john.doe@gmail.com', role: CalendarShareRole.READER};
    const writer: CalendarShare = {email: 'anna@gmail.com', role: CalendarShareRole.WRITER};

    function setShares(shares: CalendarShare[]): void {
        fixture.componentRef.setInput('shares', shares);
        fixture.detectChanges();
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GoogleCalendarSharesComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(GoogleCalendarSharesComponent);
        component = fixture.componentInstance;
        added = undefined;
        revoked = undefined;
        component.add.subscribe(share => added = share);
        component.revoke.subscribe(share => revoked = share);
    });

    it('should list people with their access', () => {
        setShares([reader, writer]);

        expect(text()).toContain('john.doe@gmail.com');
        expect(text()).toContain('Can view');
        expect(text()).toContain('anna@gmail.com');
        expect(text()).toContain('Can edit');
    });

    it('should say when the calendar is not shared with anyone', () => {
        setShares([]);

        expect(text()).toContain("isn't shared with anyone yet");
    });

    it('should emit the share to revoke', () => {
        setShares([reader]);

        let revokeButton = fixture.nativeElement.querySelector('[aria-label="Revoke access for john.doe@gmail.com"]');
        expect(revokeButton).withContext('revoke button').not.toBeNull();
        revokeButton.click();

        expect(revoked).toEqual(reader);
    });

    it('should not offer to revoke access the application cannot give back', () => {
        setShares([{email: 'boss@gmail.com', role: CalendarShareRole.OWNER}]);

        expect(fixture.nativeElement.querySelector('[aria-label="Revoke access for boss@gmail.com"]')).toBeNull();
        expect(text()).toContain('Managed in Google');
    });

    it('should emit a new share with trimmed email and chosen access', () => {
        setShares([reader]);
        component.form.setValue({email: ' anna@gmail.com ', role: CalendarShareRole.WRITER});

        component.onAdd();

        expect(added).toEqual({email: 'anna@gmail.com', role: CalendarShareRole.WRITER});
    });

    it('should not emit a share for an invalid email or a person who already has access', () => {
        setShares([reader]);

        component.form.setValue({email: 'not an email', role: CalendarShareRole.READER});
        component.onAdd();
        component.form.setValue({email: '   ', role: CalendarShareRole.READER});
        expect(component.canAdd).withContext('spaces only').toBeFalse();
        component.onAdd();
        component.form.setValue({email: 'John.Doe@gmail.com', role: CalendarShareRole.WRITER});
        component.onAdd();

        expect(added).toBeUndefined();
        expect(component.alreadyShared).toBeTrue();
    });

    it('should clear the form once the new person shows up in the list', () => {
        setShares([reader]);
        component.form.setValue({email: 'anna@gmail.com', role: CalendarShareRole.WRITER});

        setShares([reader, writer]);

        expect(component.form.getRawValue()).toEqual({email: '', role: CalendarShareRole.READER});
    });
});
