import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSupervisionVisitComponent } from './add-supervision-visit.component';

describe('AddSupervisionVisitComponent', () => {
  let component: AddSupervisionVisitComponent;
  let fixture: ComponentFixture<AddSupervisionVisitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddSupervisionVisitComponent]
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
