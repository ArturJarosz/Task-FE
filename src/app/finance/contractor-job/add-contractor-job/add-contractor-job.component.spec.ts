import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractorJobComponent } from './add-contractor-job.component';

describe('AddContractorJobComponent', () => {
  let component: AddContractorJobComponent;
  let fixture: ComponentFixture<AddContractorJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddContractorJobComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddContractorJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
