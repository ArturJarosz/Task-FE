import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorDetailShellComponent } from './contractor-detail-shell.component';

describe('ContractorDetailShellComponent', () => {
  let component: ContractorDetailShellComponent;
  let fixture: ComponentFixture<ContractorDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractorDetailShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractorDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
