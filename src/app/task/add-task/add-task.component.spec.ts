import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AddTaskComponent} from './add-task.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('AddTaskComponent', () => {
    let component: AddTaskComponent;
    let fixture: ComponentFixture<AddTaskComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddTaskComponent],
            providers: provideTestDependencies()
        })
            .compileComponents();

        fixture = TestBed.createComponent(AddTaskComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component)
            .toBeTruthy();
    });

    it('should start with no type selected', () => {
        expect(component.addTaskForm.controls.type.value).toBe('');
        expect(component.isSaveEnabled()).toBeFalse();
    });

    it('should send the chosen type as a numeric typeId', () => {
        let createTask = spyOn(component.taskStore, 'createTask');
        component.addTaskForm.patchValue({name: 'Living room render', type: '101', architectId: 1});

        component.onSave();

        expect(createTask).toHaveBeenCalledWith(jasmine.objectContaining({task: jasmine.objectContaining({typeId: 101})}));
    });
});
