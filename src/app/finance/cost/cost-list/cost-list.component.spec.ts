import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostListComponent } from './cost-list.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('CostListComponent', () => {
  let component: CostListComponent;
  let fixture: ComponentFixture<CostListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostListComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projectCostsData', {costs: []});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
