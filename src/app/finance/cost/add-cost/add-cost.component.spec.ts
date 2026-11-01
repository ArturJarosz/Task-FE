import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCostComponent } from './add-cost.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('AddCostComponent', () => {
  let component: AddCostComponent;
  let fixture: ComponentFixture<AddCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCostComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with no category selected', () => {
    expect(component.addCostForm.controls.category.value).toBe('');
    expect(component.isSaveEnabled()).toBeFalse();
  });

  it('should send the chosen category as a numeric categoryId', () => {
    let createCost = spyOn(component.costStore, 'createCost');
    component.addCostForm.patchValue({name: 'Fuel for site visit', category: '101', value: 120});

    component.onSave();

    expect(createCost).toHaveBeenCalledWith({cost: jasmine.objectContaining({categoryId: 101})});
  });
});
