import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionShellComponent } from './supervision-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('SupervisionShellComponent', () => {
  let component: SupervisionShellComponent;
  let fixture: ComponentFixture<SupervisionShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisionShellComponent],
      providers: provideTestDependencies()
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
