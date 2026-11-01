import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentListComponent } from './installment-list.component';
import {provideTestDependencies} from '../../../../testing/test-providers';
import {InstallmentType} from '../../../generated/models';

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

  it('should list the deposit first and name it "Deposit"', () => {
    fixture.componentRef.setInput('installmentProjectData', {installments: [
      {id: 1, type: InstallmentType.STAGE, stageId: 10, stageName: 'Concept', value: 1000},
      {id: 2, type: InstallmentType.DEPOSIT, value: 3000}
    ]});
    fixture.detectChanges();

    expect(component.installments.map(installment => installment.id)).toEqual([2, 1]);
    const firstRow: HTMLElement = fixture.nativeElement.querySelector('tbody tr');
    expect(firstRow.textContent).toContain('Deposit');
  });
});
