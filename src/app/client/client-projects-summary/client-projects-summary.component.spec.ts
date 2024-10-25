import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProjectsSummaryComponent } from './client-projects-summary.component';

describe('ClientProjectsSummaryComponent', () => {
  let component: ClientProjectsSummaryComponent;
  let fixture: ComponentFixture<ClientProjectsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientProjectsSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientProjectsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
