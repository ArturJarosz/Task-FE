import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideTestDependencies} from '../../../testing/test-providers';

import {EditProjectTypeComponent} from './edit-project-type.component';

describe('EditProjectTypeComponent', () => {
    let fixture: ComponentFixture<EditProjectTypeComponent>;
    let component: EditProjectTypeComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditProjectTypeComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(EditProjectTypeComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('projectTypes', [
            {id: 100, name: 'Concept'},
            {id: 101, name: 'Interior house'}
        ]);
    });

    it('should not save a name another project type already has, whatever the letter case', () => {
        fixture.componentRef.setInput('projectType', {name: ''});
        fixture.detectChanges();
        let saved = jasmine.createSpy('save');
        component.save.subscribe(saved);

        component.name.setValue(' interior HOUSE ');
        component.onSave();

        expect(component.nameTaken).toBeTrue();
        expect(saved).not.toHaveBeenCalled();
    });

    it('should let a project type keep its own name and save it trimmed', () => {
        fixture.componentRef.setInput('projectType', {id: 101, name: 'Interior house'});
        fixture.detectChanges();
        let saved = jasmine.createSpy('save');
        component.save.subscribe(saved);

        component.name.setValue(' Interior House ');
        component.onSave();

        expect(saved).toHaveBeenCalledWith({id: 101, name: 'Interior House'});
    });

    it('should not save a blank name', () => {
        fixture.componentRef.setInput('projectType', {name: ''});
        fixture.detectChanges();
        let saved = jasmine.createSpy('save');
        component.save.subscribe(saved);

        component.name.setValue('   ');
        component.onSave();

        expect(saved).not.toHaveBeenCalled();
    });

    it('should keep the typed name while saving and after a failed save', () => {
        fixture.componentRef.setInput('projectType', {id: 100, name: 'Concept'});
        fixture.detectChanges();

        component.name.setValue('Concept 2');
        fixture.componentRef.setInput('saving', true);
        fixture.detectChanges();
        fixture.componentRef.setInput('saving', false);
        fixture.componentRef.setInput('projectTypes', [{id: 100, name: 'Concept'}]);
        fixture.detectChanges();

        expect(component.name.value).toBe('Concept 2');
    });
});
