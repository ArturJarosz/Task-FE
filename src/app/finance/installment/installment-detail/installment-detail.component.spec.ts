import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InstallmentDetailComponent} from './installment-detail.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('InstallmentDetailComponent', () => {
    let component: InstallmentDetailComponent;
    let fixture: ComponentFixture<InstallmentDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InstallmentDetailComponent],
            providers: provideTestDependencies()
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
