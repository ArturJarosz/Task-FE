import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitectDetailComponent } from './architect-detail.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ArchitectDetailComponent', () => {
  let component: ArchitectDetailComponent;
  let fixture: ComponentFixture<ArchitectDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArchitectDetailComponent],
      providers: provideTestDependencies()
    });
    fixture = TestBed.createComponent(ArchitectDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('architect', {firstName: 'Anna', lastName: 'Nowak'});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
