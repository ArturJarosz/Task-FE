import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitectProjectsSummaryComponent } from './architect-projects-summary.component';

describe('ArchitectProjectsSummaryComponent', () => {
  let component: ArchitectProjectsSummaryComponent;
  let fixture: ComponentFixture<ArchitectProjectsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArchitectProjectsSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArchitectProjectsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
