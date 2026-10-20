import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InstallmentDetailShellComponent} from './installment-detail-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('InstallmentDetailShellComponent', () => {
    let component: InstallmentDetailShellComponent;
    let fixture: ComponentFixture<InstallmentDetailShellComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InstallmentDetailShellComponent],
            providers: provideTestDependencies()
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
