import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorJobListComponent } from './contractor-job-list.component';

describe('ContractorJobListComponent', () => {
  let component: ContractorJobListComponent;
  let fixture: ComponentFixture<ContractorJobListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractorJobListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractorJobListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
