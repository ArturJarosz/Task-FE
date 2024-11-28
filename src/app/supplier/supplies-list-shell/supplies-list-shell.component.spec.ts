import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliesListShellComponent } from './supplies-list-shell.component';

describe('SuppliesLisShellComponent', () => {
  let component: SuppliesListShellComponent;
  let fixture: ComponentFixture<SuppliesListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuppliesListShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliesListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
