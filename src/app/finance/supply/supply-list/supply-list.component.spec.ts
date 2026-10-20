import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyListComponent } from './supply-list.component';

describe('SupplyListComponent', () => {
  let component: SupplyListComponent;
  let fixture: ComponentFixture<SupplyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
