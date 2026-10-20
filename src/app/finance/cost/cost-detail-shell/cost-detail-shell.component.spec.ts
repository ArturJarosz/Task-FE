import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostDetailShellComponent } from './cost-detail-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('CostDetailShellComponent', () => {
  let component: CostDetailShellComponent;
  let fixture: ComponentFixture<CostDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostDetailShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
