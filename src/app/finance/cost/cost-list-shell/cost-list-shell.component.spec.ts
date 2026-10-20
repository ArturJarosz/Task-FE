import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostListShellComponent } from './cost-list-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('CostListShellComponent', () => {
  let component: CostListShellComponent;
  let fixture: ComponentFixture<CostListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostListShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
