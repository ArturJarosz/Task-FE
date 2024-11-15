import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorJobListShellComponent } from './contractor-job-list-shell.component';

describe('ContractorJobListShellComponent', () => {
  let component: ContractorJobListShellComponent;
  let fixture: ComponentFixture<ContractorJobListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractorJobListShellComponent]
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
