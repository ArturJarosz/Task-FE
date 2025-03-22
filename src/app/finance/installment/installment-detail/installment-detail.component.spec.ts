import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InstallmentDetailComponent} from './installment-detail.component';

describe('InstallmentDetailComponent', () => {
    let component: InstallmentDetailComponent;
    let fixture: ComponentFixture<InstallmentDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InstallmentDetailComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(InstallmentDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component)
            .toBeTruthy();
    });
});
