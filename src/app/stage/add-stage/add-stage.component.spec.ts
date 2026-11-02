import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStageComponent } from './add-stage.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('AddStageComponent', () => {
  let component: AddStageComponent;
  let fixture: ComponentFixture<AddStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStageComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with no type selected', () => {
    expect(component.addStageForm.controls.type.value).toBe('');
    expect(component.isSaveEnabled()).toBeFalse();
  });

  it('should send the chosen type as a numeric typeId', () => {
    let createStage = spyOn(component.stageStore, 'createStage');
    component.addStageForm.patchValue({name: 'Functional layout', type: '101', architectId: 1});

    component.onSave();

    expect(createStage).toHaveBeenCalledWith(jasmine.objectContaining({stage: jasmine.objectContaining({typeId: 101})}));
  });
});
