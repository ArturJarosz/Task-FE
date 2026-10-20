import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStageComponent } from './add-stage.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('AddStageComponent', () => {
  let component: AddStageComponent;
  let fixture: ComponentFixture<AddStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStageComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
