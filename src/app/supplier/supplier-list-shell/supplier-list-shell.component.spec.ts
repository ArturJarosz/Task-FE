import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierListShellComponent } from './supplier-list-shell.component';

describe('SupplierListShellComponent', () => {
  let component: SupplierListShellComponent;
  let fixture: ComponentFixture<SupplierListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupplierListShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
