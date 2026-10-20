import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitectDetailShellComponent } from './architect-detail-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ArchitectDetailShellComponent', () => {
  let component: ArchitectDetailShellComponent;
  let fixture: ComponentFixture<ArchitectDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchitectDetailShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArchitectDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
