import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionShellComponent } from './supervision-shell.component';

describe('SupervisionShellComponent', () => {
  let component: SupervisionShellComponent;
  let fixture: ComponentFixture<SupervisionShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupervisionShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisionShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
