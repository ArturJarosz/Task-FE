import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierListShellComponent } from './supplier-list-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('SupplierListShellComponent', () => {
  let component: SupplierListShellComponent;
  let fixture: ComponentFixture<SupplierListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierListShellComponent],
      providers: provideTestDependencies()
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
