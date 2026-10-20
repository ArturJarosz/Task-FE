import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailShellComponent } from './client-detail-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ClientDetailShellComponent', () => {
  let component: ClientDetailShellComponent;
  let fixture: ComponentFixture<ClientDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
