import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { FinanceComponentSummaryComponent } from './finance-component-summary.component';

describe('FinanceComponentSummaryComponent', () => {
  let component: FinanceComponentSummaryComponent;
  let fixture: ComponentFixture<FinanceComponentSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceComponentSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceComponentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // count items and a gross total, as the parents pass them
  const summary = (count: number) => new FormBuilder().nonNullable.group({
    count: count, paid: count, grossValue: 4305, netValue: 3500, incomeTax: 630, vatTax: 805
  });

  it('should show the average per item under each total only from two items on', () => {
    fixture.componentRef.setInput('hasAveragedData', true);
    fixture.componentRef.setInput('financeComponentDataForm', summary(1));
    fixture.componentRef.setInput('averageFinanceComponentDataForm', summary(1));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Average');

    fixture.componentRef.setInput('financeComponentDataForm', summary(2));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('dd.text-xs').length).toBe(4);
    expect(fixture.nativeElement.textContent).toContain('Average');
  });

  it('should put the add button under the figures, and none without a label', () => {
    fixture.componentRef.setInput('financeComponentDataForm', summary(1));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-button')).toBeNull();

    fixture.componentRef.setInput('addLabel', 'Add cost');
    fixture.detectChanges();
    const add = jasmine.createSpy('add');
    component.add.subscribe(add);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('p-button button');
    expect(button.textContent?.trim()).toBe('Add cost');
    // The figures come first, then the button
    const figures: HTMLElement = fixture.nativeElement.querySelector('dl');
    expect(figures.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    button.click();
    expect(add).toHaveBeenCalled();
  });
});
