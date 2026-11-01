import { ComponentFixture, TestBed } from '@angular/core/testing';

import {AddInstallmentComponent} from './add-installment.component';
import {provideTestDependencies} from '../../../../testing/test-providers';
import {InstallmentStore} from '../state/installment.state';
import {InstallmentType} from '../../../generated/models';

describe('AddInstallmentComponent', () => {
  let component: AddInstallmentComponent;
  let fixture: ComponentFixture<AddInstallmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInstallmentComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddInstallmentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stages', [{id: 10, name: 'Concept'}, {id: 11, name: 'Executive design'}]);
    fixture.componentRef.setInput('stagesWithoutInstallmentIds', [10, 11]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep save off while the value is 0', () => {
    expect(component.addInstallmentForm.controls.value.value).toBe(0);
    expect(component.isSaveEnabled()).toBeFalse();
  });

  it('should create a stage installment for the picked stage', () => {
    const store = TestBed.inject(InstallmentStore);
    spyOn(store, 'createInstallment');
    component.addInstallmentForm.patchValue({stageId: 11, value: 1000});

    expect(component.isSaveEnabled()).toBeTrue();
    component.onSave();

    expect(store.createInstallment).toHaveBeenCalledWith({
      installment: jasmine.objectContaining({type: InstallmentType.STAGE, stageId: 11, value: 1000})
    });
  });
});
