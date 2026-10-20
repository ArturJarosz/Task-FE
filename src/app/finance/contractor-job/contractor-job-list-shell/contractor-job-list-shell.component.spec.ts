import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorJobListShellComponent } from './contractor-job-list-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('ContractorJobListShellComponent', () => {
  let component: ContractorJobListShellComponent;
  let fixture: ComponentFixture<ContractorJobListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractorJobListShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractorJobListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
