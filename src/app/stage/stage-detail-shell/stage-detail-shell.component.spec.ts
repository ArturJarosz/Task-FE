import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageDetailShellComponent } from './stage-detail-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('StageDetailShellComponent', () => {
  let component: StageDetailShellComponent;
  let fixture: ComponentFixture<StageDetailShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StageDetailShellComponent],
      providers: provideTestDependencies()
    });
    fixture = TestBed.createComponent(StageDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
