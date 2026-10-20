import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractorComponent } from './add-contractor.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('AddContractorComponent', () => {
  let component: AddContractorComponent;
  let fixture: ComponentFixture<AddContractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContractorComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
