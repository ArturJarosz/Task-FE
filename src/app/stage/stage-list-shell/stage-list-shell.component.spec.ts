import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageListShellComponent } from './stage-list-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('StageListShellComponent', () => {
  let component: StageListShellComponent;
  let fixture: ComponentFixture<StageListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageListShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StageListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
