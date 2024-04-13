import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageDetailShellComponent } from './stage-detail-shell.component';

describe('StageDetailShellComponent', () => {
  let component: StageDetailShellComponent;
  let fixture: ComponentFixture<StageDetailShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StageDetailShellComponent]
    });
    fixture = TestBed.createComponent(StageDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
