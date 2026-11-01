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

  it('should show the category name of each cost by its categoryId', () => {
    fixture.componentRef.setInput('costCategories', [{id: '100', label: 'Fuel'}, {id: '101', label: 'Parking'}]);
    fixture.componentRef.setInput('projectCostsData', {costs: [{id: 1, name: 'Site visit', categoryId: 101, value: 20}]});
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tbody tr').textContent).toContain('Parking');
  });

  it('should not show a bare category id before the categories are loaded', () => {
    fixture.componentRef.setInput('costCategories', []);

    expect(component.getCostCategoryLabel(101)).toBe('');
  });
});
