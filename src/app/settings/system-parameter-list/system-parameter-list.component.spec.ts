import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SystemParameterListComponent} from './system-parameter-list.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('SystemParameterListComponent', () => {
    let fixture: ComponentFixture<SystemParameterListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SystemParameterListComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(SystemParameterListComponent);
    });

    function valueCells(): string[] {
        return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('[role="row"]'))
            .slice(1)
            .map(row => row.querySelectorAll('[role="cell"]')[1].textContent!.trim());
    }

    it('should show whether a secret is set without its value, and booleans as On or Off', () => {
        fixture.componentRef.setInput('systemParameters', [
            {id: 1, name: 'Api key', type: 'SECRET', valueSet: true},
            {id: 2, name: 'Other key', type: 'SECRET', valueSet: false},
            {id: 3, name: 'Feature flag', type: 'BOOLEAN', value: 'true'},
            {id: 4, name: 'Other flag', type: 'BOOLEAN', value: 'false'},
        ]);
        fixture.detectChanges();

        expect(valueCells()).toEqual(['Set', 'Not set', 'On', 'Off']);
    });
});
