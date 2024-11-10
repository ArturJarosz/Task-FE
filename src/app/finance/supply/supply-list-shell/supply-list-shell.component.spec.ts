import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyListShellComponent } from './supply-list-shell.component';

describe('SupplyListShellComponent', () => {
  let component: SupplyListShellComponent;
  let fixture: ComponentFixture<SupplyListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupplyListShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplyListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
