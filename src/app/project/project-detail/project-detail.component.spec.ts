import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailComponent } from './project-detail.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {ContractStatus, InstallmentType, Project, ProjectStatus} from '../../generated/models';
import {ContractStore} from '../contract-status/state/contract.store';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: provideTestDependencies()
    });
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    // The form is built in ngOnChanges, which only runs once an input is set
    fixture.componentRef.setInput('project', null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('ProjectDetailComponent edit forms', () => {
  // Dates on both the project and the contract: they come back from the form as new Date objects
  const project: Project = {
    id: 1,
    name: 'Lublin 01',
    typeId: 1,
    status: ProjectStatus.IN_PROGRESS,
    startDate: '2026-01-10',
    endDate: '2026-12-20',
    architect: {id: 2, firstName: 'Anna', lastName: 'Nowak'},
    client: {id: 3, firstName: 'Jan', lastName: 'Kowalski'},
    contract: {
      id: 4, offerValue: 50000, status: ContractStatus.SIGNED,
      signingDate: '2026-01-05', startDate: '2026-01-10', endDate: '2026-12-20', deadline: '2026-12-31'
    }
  };
  let component: ProjectDetailComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: provideTestDependencies()
    });
    const fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('project', project);
    fixture.detectChanges();
    component.onEditContract();
  });

  it('should keep contract save off after an edit is reverted', () => {
    const offerValue = component.projectDetailsForm.controls.contract.controls.offerValue;
    offerValue.setValue(60000);
    offerValue.markAsDirty();
    offerValue.setValue(50000);

    expect(component.shouldUpdateContract()).toBeFalse();
  });

  it('should turn contract save on when the value or a date changes', () => {
    const contract = component.projectDetailsForm.controls.contract;
    contract.controls.offerValue.setValue(60000);
    contract.markAsDirty();

    expect(component.shouldUpdateContract()).toBeTrue();

    contract.controls.offerValue.setValue(50000);
    contract.controls.deadline!.setValue(new Date('2027-01-15'));

    expect(component.shouldUpdateContract()).toBeTrue();
  });

  it('should keep project save off after an edit is reverted', () => {
    const name = component.projectDetailsForm.controls.name;
    name.setValue('Lublin 02');
    name.markAsDirty();
    name.setValue('Lublin 01');

    expect(component.shouldUpdateProject()).toBeFalse();
  });
});

describe('ProjectDetailComponent deposit on signing', () => {
  const project: Project = {
    id: 1,
    name: 'Lublin 01',
    typeId: 1,
    status: ProjectStatus.TO_DO,
    architect: {id: 2, firstName: 'Anna', lastName: 'Nowak'},
    client: {id: 3, firstName: 'Jan', lastName: 'Kowalski'},
    contract: {id: 4, offerValue: 50000, status: ContractStatus.ACCEPTED, nextStatuses: [ContractStatus.SIGNED]}
  };
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

  function sign(): void {
    const contract = component.projectDetailsForm.controls.contract;
    contract.controls.status.setValue(ContractStatus.SIGNED);
    contract.controls.signingDate!.setValue(new Date(2026, 9, 20));
    contract.markAsDirty();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: provideTestDependencies()
    });
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('project', project);
    fixture.componentRef.setInput('hasDeposit', false);
    fixture.detectChanges();
    component.onEditContract();
  });

  it('should require the deposit only while signing', () => {
    expect(component.depositRequired).toBeFalse();

    sign();

    expect(component.depositRequired).toBeTrue();
  });

  it('should not ask for a deposit when the project already has one', () => {
    fixture.componentRef.setInput('hasDeposit', true);
    fixture.detectChanges();
    sign();

    expect(component.depositRequired).toBeFalse();
    expect(component.canSaveContract).toBeTrue();
  });

  it('should ask for the deposit while it is not known whether the project has one', () => {
    fixture.componentRef.setInput('hasDeposit', null);
    fixture.detectChanges();
    sign();

    expect(component.depositRequired).toBeTrue();
  });

  it('should keep save off until the deposit is valid', () => {
    sign();

    expect(component.canSaveContract).toBeFalse();

    component.depositForm.controls.value.setValue(3000);

    expect(component.canSaveContract).toBeTrue();
  });

  it('should show the deposit fields while signing', () => {
    sign();
    fixture.detectChanges();

    expect(document.body.querySelector('#contractDepositValue')).not.toBeNull();
  });

  it('should date a paid deposit on the signing day', () => {
    sign();
    component.depositForm.controls.paid.setValue(true);
    component.onDepositPaidChange(true);

    expect(component.depositForm.controls.paymentDate.value).toEqual(new Date(2026, 9, 20));
  });

  it('should send the deposit with the signed contract', () => {
    const contractStore = TestBed.inject(ContractStore);
    spyOn(contractStore, 'changeStatus');
    sign();
    component.depositForm.patchValue({value: 3000, hasInvoice: true});

    component.onContractUpdate();

    expect(contractStore.changeStatus).toHaveBeenCalledWith({
      contract: jasmine.objectContaining({
        status: ContractStatus.SIGNED,
        deposit: jasmine.objectContaining({type: InstallmentType.DEPOSIT, value: 3000, hasInvoice: true, paid: false})
      })
    });
  });
});
