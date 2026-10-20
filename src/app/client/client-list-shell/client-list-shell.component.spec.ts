import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientListShellComponent } from './client-list-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ClientListShellComponent', () => {
  let component: ClientListShellComponent;
  let fixture: ComponentFixture<ClientListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientListShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
