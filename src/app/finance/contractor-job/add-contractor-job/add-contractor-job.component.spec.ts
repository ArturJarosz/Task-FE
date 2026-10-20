import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractorJobComponent } from './add-contractor-job.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('AddContractorJobComponent', () => {
  let component: AddContractorJobComponent;
  let fixture: ComponentFixture<AddContractorJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContractorJobComponent],
      providers: provideTestDependencies()
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
