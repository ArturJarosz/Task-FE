import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProjectsSummaryShellComponent } from './client-projects-summary-shell.component';

describe('ClientProjectsSummaryShellComponent', () => {
  let component: ClientProjectsSummaryShellComponent;
  let fixture: ComponentFixture<ClientProjectsSummaryShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientProjectsSummaryShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientProjectsSummaryShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
