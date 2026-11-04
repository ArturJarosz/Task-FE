import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LinkAccountComponent} from './link-account.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('LinkAccountComponent', () => {
    let component: LinkAccountComponent;
    let fixture: ComponentFixture<LinkAccountComponent>;

    const maria = {id: 1, username: 'Maria', email: 'maria@example.com'};
    const jan = {id: 2, username: 'jan@example.com', email: 'jan@example.com'};
    const architect = {id: 10, firstName: 'Anna', lastName: 'Nowak'};
    const otherArchitect = {id: 11, firstName: 'Piotr', lastName: 'Zielinski', linkedUser: jan};

    function open(inputs: {architect?: object, users?: object[] | null, architects?: object[] | null}): void {
        fixture.componentRef.setInput('users', inputs.users === undefined ? [maria, jan] : inputs.users);
        fixture.componentRef.setInput('architects', inputs.architects === undefined ? [architect, otherArchitect] : inputs.architects);
        fixture.componentRef.setInput('architect', inputs.architect ?? architect);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LinkAccountComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(LinkAccountComponent);
        component = fixture.componentInstance;
    });

    it('marks an account linked with another architect as disabled and names that architect', () => {
        open({});

        expect(component.options[0].disabled).toBeFalse();
        expect(component.options[1].disabled).toBeTrue();
        expect(component.options[1].note).toBe('Linked to Piotr Zielinski');
    });

    it('leaves out an email that only repeats the username', () => {
        open({});

        expect(component.options[0].email).toBe('maria@example.com');
        expect(component.options[1].email).toBe('');
    });

    it('starts with the linked account and can only save another one', () => {
        open({architect: {...architect, linkedUser: maria}});

        expect(component.account.value).toBe(1);
        expect(component.canSave).toBeFalse();

        component.account.setValue(2);

        expect(component.canSave).toBeTrue();
    });

    it('emits the picked account on save', () => {
        open({});
        spyOn(component.save, 'emit');

        component.onSave();
        expect(component.save.emit).not.toHaveBeenCalled();

        component.account.setValue(1);
        component.onSave();
        expect(component.save.emit).toHaveBeenCalledOnceWith(1);
    });

    it('is loading until both lists are there', () => {
        open({users: null});

        expect(component.isLoading).toBeTrue();
        expect(component.canSave).toBeFalse();
    });

    it('renders the unlink button only for a linked architect', () => {
        open({});
        expect(document.body.textContent).not.toContain('Unlink account');

        fixture.componentRef.setInput('architect', {...architect, linkedUser: maria});
        fixture.detectChanges();
        expect(component.account.value).toBe(1);
        expect(document.body.textContent).toContain('Unlink account');
        expect(document.body.textContent).toContain('People appear here after their first login.');
    });

    it('shows a way to try again when accounts could not load', () => {
        open({users: null});
        fixture.componentRef.setInput('loadFailed', true);
        fixture.detectChanges();

        expect(document.body.textContent).toContain("Couldn't load accounts");
        expect(component.canSave).toBeFalse();
    });

    it('names an account without a profile and does not let it be picked', () => {
        open({users: [{id: 3, username: '', email: ''}, {id: 4, username: '', email: 'ewa@example.com'}]});

        expect(component.options[0].username).toBe('Unnamed account');
        expect(component.options[0].disabled).toBeTrue();
        expect(component.options[0].note).toBe('No name or email yet');
        expect(component.options[1].username).toBe('ewa@example.com');
        expect(component.options[1].disabled).toBeFalse();
    });

    it('drops the picked account when reloaded lists show it was taken', () => {
        open({});
        component.account.setValue(1);

        fixture.componentRef.setInput('architects', null);
        fixture.detectChanges();
        expect(component.account.value).toBe(1);

        fixture.componentRef.setInput('architects', [architect, {...otherArchitect, linkedUser: maria}]);
        fixture.detectChanges();

        expect(component.account.value).toBeNull();
        expect(component.canSave).toBeFalse();
    });

    it('keeps the current account selected when lists reload', () => {
        open({architect: {...architect, linkedUser: maria}});

        fixture.componentRef.setInput('users', [jan]);
        fixture.detectChanges();

        expect(component.account.value).toBe(1);
    });

    it('keeps the picked account when the lists reload', () => {
        open({});
        component.account.setValue(1);

        fixture.componentRef.setInput('users', [maria]);
        fixture.detectChanges();

        expect(component.account.value).toBe(1);
    });
});
