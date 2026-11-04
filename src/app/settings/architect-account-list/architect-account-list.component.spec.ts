import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ArchitectAccountListComponent} from './architect-account-list.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ArchitectAccountListComponent', () => {
    let component: ArchitectAccountListComponent;
    let fixture: ComponentFixture<ArchitectAccountListComponent>;

    const linked = {
        id: 1, firstName: 'Anna', lastName: 'Nowak',
        linkedUser: {id: 5, username: 'Maria Kowalska', email: 'maria@example.com'}
    };
    const notLinked = {id: 2, firstName: 'Piotr', lastName: 'Zielinski'};

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ArchitectAccountListComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(ArchitectAccountListComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('architects', [linked, notLinked]);
        fixture.detectChanges();
    });

    it('shows the linked account and "Not set" for an architect without one', () => {
        let rows = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="row"]');

        expect(rows[1].textContent).toContain('Anna Nowak');
        expect(rows[1].textContent).toContain('Maria Kowalska');
        expect(rows[1].textContent).toContain('maria@example.com');
        expect(rows[2].textContent).toContain('Piotr Zielinski');
        expect(rows[2].textContent).toContain('Not set');
    });

    it('names a linked account without a profile', () => {
        fixture.componentRef.setInput('architects', [{...notLinked, linkedUser: {id: 6, username: '', email: ''}}]);
        fixture.detectChanges();

        expect((fixture.nativeElement as HTMLElement).textContent).toContain('Unnamed account');
    });

    it('asks to edit the account of the architect in the clicked row', () => {
        spyOn(component.editAccount, 'emit');

        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('p-button button')[1].click();

        expect(component.editAccount.emit).toHaveBeenCalledOnceWith(notLinked);
    });

    it('offers to try again after a failed load', () => {
        fixture.componentRef.setInput('loadFailed', true);
        fixture.detectChanges();

        expect((fixture.nativeElement as HTMLElement).textContent).toContain("Couldn't load architects");
    });
});
