import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NotificationSettingsComponent, reminderShortLabel} from './notification-settings.component';
import {NotificationSetting} from '../../generated/models/notification-setting';
import {NotificationType} from '../../generated/models/notification-type';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('NotificationSettingsComponent', () => {
    let fixture: ComponentFixture<NotificationSettingsComponent>;
    let component: NotificationSettingsComponent;

    const settings: NotificationSetting[] = [
        {type: NotificationType.MEETING, enabled: true, daysBefore: [1]},
        {type: NotificationType.COMPANY_COST_PAYMENT, enabled: false, daysBefore: [1]},
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NotificationSettingsComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(NotificationSettingsComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('settings', settings);
        fixture.detectChanges();
    });

    function saveButton(): HTMLButtonElement {
        return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
            .find(button => button.textContent?.includes('Save changes')) as HTMLButtonElement;
    }

    it('lists each type by name only', () => {
        const text = (fixture.nativeElement as HTMLElement).textContent;

        expect(text).toContain('Meetings');
        expect(text).toContain('Company cost payments');
        expect(text).not.toContain('Charges not paid yet');
        expect(text).not.toContain('Architect accounts');
    });

    it('saves only after something changed, with the changed values', () => {
        expect(saveButton().disabled).toBeTrue();
        const saved: NotificationSetting[][] = [];
        component.save.subscribe(value => saved.push(value));

        component.setEnabled(NotificationType.COMPANY_COST_PAYMENT, true);
        component.setNewDays(component.draft()[0], 10);
        component.addReminder(component.draft()[0]);
        fixture.detectChanges();
        saveButton().click();

        expect(saved).toEqual([[
            {type: NotificationType.MEETING, enabled: true, daysBefore: [10, 1]},
            {type: NotificationType.COMPANY_COST_PAYMENT, enabled: true, daysBefore: [1]},
        ]]);
    });

    it('shows the reminders as days, and "Off" for a type that is off', () => {
        const text = (fixture.nativeElement as HTMLElement).textContent;

        expect(text).toContain('Days before');
        expect(text).toContain('1 day');
        expect(text).toContain('Off');
        expect(reminderShortLabel(0)).toBe('On the day');
        expect(reminderShortLabel(10)).toBe('10 days');
    });

    it('adds a reminder once, keeps them furthest first and stops at five', () => {
        const meeting = () => component.draft()[0];
        for (const days of [3, 1, 7, 0]) {
            component.setNewDays(meeting(), days);
            component.addReminder(meeting());
        }
        expect(meeting().daysBefore).toEqual([7, 3, 1, 0]);
        expect(component.newDays(meeting())).toBeNull();

        component.setNewDays(meeting(), 3);
        expect(component.canAdd(meeting())).toBeFalse();

        component.setNewDays(meeting(), 30);
        component.addReminder(meeting());
        component.setNewDays(meeting(), 14);
        expect(component.canAdd(meeting())).toBeFalse();
        expect(meeting().daysBefore).toEqual([30, 7, 3, 1, 0]);

        component.removeReminder(meeting(), 3);
        expect(meeting().daysBefore).toEqual([30, 7, 1, 0]);
    });

    it('adds the typed days in place, on Enter or when leaving the field, and drops them on Escape', () => {
        const meeting = () => component.draft()[0];
        component.startAdding(meeting());
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).querySelector('p-inputnumber')).not.toBeNull();

        component.setNewDays(meeting(), 1);
        component.finishAdding(meeting());
        expect(component.addingType()).toBe(NotificationType.MEETING);

        component.setNewDays(meeting(), 2);
        component.finishAdding(meeting());
        expect(meeting().daysBefore).toEqual([2, 1]);
        expect(component.addingType()).toBeNull();

        component.startAdding(meeting());
        component.setNewDays(meeting(), 2);
        component.finishAdding(meeting(), true);
        expect(meeting().daysBefore).toEqual([2, 1]);
        expect(component.addingType()).toBeNull();

        component.startAdding(meeting());
        component.setNewDays(meeting(), 5);
        component.cancelAdding(meeting());
        component.finishAdding(meeting(), true);
        expect(meeting().daysBefore).toEqual([2, 1]);
    });

    it("keeps each type's typed days apart", () => {
        const [meeting, companyCost] = component.draft();
        component.setNewDays(meeting, 5);
        component.setNewDays(companyCost, null);
        component.addReminder(meeting);

        expect(component.draft()[0].daysBefore).toEqual([5, 1]);
        expect(component.draft()[1].daysBefore).toEqual([1]);
    });

    it('saves the days typed but not added yet', () => {
        const saved: NotificationSetting[][] = [];
        component.save.subscribe(value => saved.push(value));

        component.setNewDays(component.draft()[0], 4);
        fixture.detectChanges();
        expect(saveButton().disabled).toBeFalse();
        saveButton().click();

        expect(saved).toEqual([[
            {type: NotificationType.MEETING, enabled: true, daysBefore: [4, 1]},
            {type: NotificationType.COMPANY_COST_PAYMENT, enabled: false, daysBefore: [1]},
        ]]);
        expect(component.newDays(component.draft()[0])).toBeNull();
    });

    it('asks for a reminder and blocks saving while a type that is on has none', () => {
        component.removeReminder(component.draft()[0], 1);
        fixture.detectChanges();

        expect((fixture.nativeElement as HTMLElement).textContent).toContain('Add a reminder, or turn this type off');
        expect(saveButton().disabled).toBeTrue();

        component.setEnabled(NotificationType.MEETING, false);
        fixture.detectChanges();

        expect(saveButton().disabled).toBeFalse();
    });

    it('drops the changes on Cancel', () => {
        component.setEnabled(NotificationType.MEETING, false);
        component.cancel();
        fixture.detectChanges();

        expect(component.draft()).toEqual(settings);
        expect(saveButton().disabled).toBeTrue();
    });
});
