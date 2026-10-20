import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorJobListComponent } from './contractor-job-list.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('ContractorJobListComponent', () => {
  let component: ContractorJobListComponent;
  let fixture: ComponentFixture<ContractorJobListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractorJobListComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractorJobListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contractorsJobsProjectData', {contractorJobs: []});
    fixture.componentRef.setInput('contractors', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
