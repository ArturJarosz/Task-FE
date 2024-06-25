import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentListShellComponent } from './installment-list-shell.component';

describe('InstallmentListShellComponent', () => {
  let component: InstallmentListShellComponent;
  let fixture: ComponentFixture<InstallmentListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstallmentListShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstallmentListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
