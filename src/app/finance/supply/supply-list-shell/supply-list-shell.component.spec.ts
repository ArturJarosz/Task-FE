import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyListShellComponent } from './supply-list-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('SupplyListShellComponent', () => {
  let component: SupplyListShellComponent;
  let fixture: ComponentFixture<SupplyListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyListShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplyListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
