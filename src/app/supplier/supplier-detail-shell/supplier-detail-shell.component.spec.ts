import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierDetailShellComponent } from './supplier-detail-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('SupplierDetailShellComponent', () => {
  let component: SupplierDetailShellComponent;
  let fixture: ComponentFixture<SupplierDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierDetailShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
