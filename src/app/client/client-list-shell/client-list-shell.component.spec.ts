import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientListShellComponent } from './client-list-shell.component';

describe('ClientListShellComponent', () => {
  let component: ClientListShellComponent;
  let fixture: ComponentFixture<ClientListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientListShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
