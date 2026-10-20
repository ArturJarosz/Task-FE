import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInstallmentComponent } from './add-installment.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
