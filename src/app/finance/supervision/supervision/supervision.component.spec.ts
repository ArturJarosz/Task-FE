import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionComponent } from './supervision.component';

describe('SupervisionComponent', () => {
  let component: SupervisionComponent;
  let fixture: ComponentFixture<SupervisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should put "Add visit" under the figures, right above the table', () => {
    fixture.componentRef.setInput('supervision', {id: 1, baseNetRate: 1000, hourlyNetRate: 150, hoursCount: 4, visitNetRate: 200, visitCount: 2, value: 2000});
    fixture.detectChanges();
    const addVisit = jasmine.createSpy('addVisit');
    component.notifyAddVisit.subscribe(addVisit);

    const figures: HTMLElement = fixture.nativeElement.querySelector('dl');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('p-button button');
    const table: HTMLElement = fixture.nativeElement.querySelector('p-table');
    expect(button.textContent?.trim()).toBe('Add visit');
    expect(figures.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(button.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    button.click();
    expect(addVisit).toHaveBeenCalled();
  });
});
