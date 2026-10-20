import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientComponent } from './add-client.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('AddClientComponent', () => {
  let component: AddClientComponent;
  let fixture: ComponentFixture<AddClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
