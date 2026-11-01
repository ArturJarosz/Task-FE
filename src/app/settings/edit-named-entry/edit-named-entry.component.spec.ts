import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideTestDependencies} from '../../../testing/test-providers';

import {EditNamedEntryComponent} from './edit-named-entry.component';
import {CONTRACTOR_CATEGORY_TEXTS} from '../named-entry';

describe('EditNamedEntryComponent', () => {
    let fixture: ComponentFixture<EditNamedEntryComponent>;
    let component: EditNamedEntryComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditNamedEntryComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(EditNamedEntryComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('texts', CONTRACTOR_CATEGORY_TEXTS);
        fixture.componentRef.setInput('entries', [
            {id: 100, name: 'Electrician'},
            {id: 101, name: 'Plumber'}
        ]);
    });

    it('should not create an entry with a name another entry already has, whatever the letter case', () => {
        fixture.componentRef.setInput('entry', {name: ''});
        fixture.detectChanges();
        let saved = jasmine.createSpy('save');
        component.save.subscribe(saved);

        component.name.setValue(' PLUMBER ');
        component.onSave();

        expect(component.nameTaken).toBeTrue();
        expect(component.canSave).toBeFalse();
        expect(saved).not.toHaveBeenCalled();
    });

    it('should not rename an entry to the name of another one', () => {
        fixture.componentRef.setInput('entry', {id: 100, name: 'Electrician'});
        fixture.detectChanges();
        let saved = jasmine.createSpy('save');
        component.save.subscribe(saved);

        component.name.setValue('plumber');
        component.onSave();
        fixture.detectChanges();

        expect(component.nameTaken).toBeTrue();
        expect(saved).not.toHaveBeenCalled();
        expect(document.body.textContent).toContain('A contractor category with this name already exists');
    });

    it('should let an entry keep its own name and save it trimmed', () => {
        fixture.componentRef.setInput('entry', {id: 101, name: 'Plumber'});
        fixture.detectChanges();
        let saved = jasmine.createSpy('save');
        component.save.subscribe(saved);

        component.name.setValue(' PLUMBER ');
        component.onSave();

        expect(saved).toHaveBeenCalledWith({id: 101, name: 'PLUMBER'});
    });

    it('should not save a blank name', () => {
        fixture.componentRef.setInput('entry', {name: ''});
        fixture.detectChanges();
        let saved = jasmine.createSpy('save');
        component.save.subscribe(saved);

        component.name.setValue('   ');
        component.onSave();

        expect(saved).not.toHaveBeenCalled();
    });

    it('should keep the typed name while saving and after a failed save', () => {
        fixture.componentRef.setInput('entry', {id: 100, name: 'Electrician'});
        fixture.detectChanges();

        component.name.setValue('Electrician 2');
        fixture.componentRef.setInput('saving', true);
        fixture.detectChanges();
        fixture.componentRef.setInput('saving', false);
        fixture.componentRef.setInput('entries', [{id: 100, name: 'Electrician'}]);
        fixture.detectChanges();

        expect(component.name.value).toBe('Electrician 2');
    });

    it('should name the entry kind in the dialog of a new entry', () => {
        fixture.componentRef.setInput('entry', {name: ''});
        fixture.detectChanges();

        expect(document.body.textContent).toContain('New contractor category');
        expect(document.body.textContent).toContain('Create contractor category');
    });
});
