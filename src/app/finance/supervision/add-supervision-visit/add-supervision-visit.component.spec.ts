import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSupervisionVisitComponent } from './add-supervision-visit.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('AddSupervisionVisitComponent', () => {
  let component: AddSupervisionVisitComponent;
  let fixture: ComponentFixture<AddSupervisionVisitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSupervisionVisitComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSupervisionVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
