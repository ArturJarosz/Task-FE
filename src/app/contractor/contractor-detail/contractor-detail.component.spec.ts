import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorDetailComponent } from './contractor-detail.component';

describe('ContractorDetailComponent', () => {
  let component: ContractorDetailComponent;
  let fixture: ComponentFixture<ContractorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractorDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
