import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentListComponent } from './installment-list.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('InstallmentListComponent', () => {
  let component: InstallmentListComponent;
  let fixture: ComponentFixture<InstallmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentListComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstallmentListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('installmentProjectData', {installments: []});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
