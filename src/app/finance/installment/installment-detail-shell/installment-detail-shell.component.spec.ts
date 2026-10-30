import {ComponentFixture, TestBed} from '@angular/core/testing';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';

import {InstallmentDetailShellComponent} from './installment-detail-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';
import {InstallmentStore} from '../state/installment.state';

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

    it('should only pass on the installment the route asks for', () => {
        component.installmentId = 5;
        const store = TestBed.inject(InstallmentStore);

        patchState(unprotected(store), {installment: {id: 9, stageName: 'Other stage'}});
        expect(component.$installment()).toBeNull();

        patchState(unprotected(store), {installment: {id: 5, stageName: 'Stage 1'}});
        expect(component.$installment()?.stageName).toBe('Stage 1');
    });
});
