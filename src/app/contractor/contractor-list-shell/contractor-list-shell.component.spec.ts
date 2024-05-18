import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorListShellComponent } from './contractor-list-shell.component';

describe('ContractorListShellComponent', () => {
  let component: ContractorListShellComponent;
  let fixture: ComponentFixture<ContractorListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractorListShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractorListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
