import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InstallmentDetailShellComponent} from './installment-detail-shell.component';

describe('InstallmentDetailShellComponent', () => {
    let component: InstallmentDetailShellComponent;
    let fixture: ComponentFixture<InstallmentDetailShellComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InstallmentDetailShellComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(InstallmentDetailShellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component)
            .toBeTruthy();
    });
});
