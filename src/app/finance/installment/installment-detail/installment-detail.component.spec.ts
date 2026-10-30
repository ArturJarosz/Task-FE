import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InstallmentDetailComponent} from './installment-detail.component';
import {provideTestDependencies} from '../../../../testing/test-providers';
import {Installment} from '../../../generated/models/installment';
import {InstallmentSave} from '../state/installment.state';

describe('InstallmentDetailComponent', () => {
    const unpaidInstallment: Installment = {
        id: 5, stageId: 2, stageName: 'Stage 1', value: 1000, hasInvoice: false, paid: false, note: 'First payment'
    };
    const paidInstallment: Installment = {...unpaidInstallment, paid: true, paymentDate: '2026-10-15'};
    let component: InstallmentDetailComponent;
    let fixture: ComponentFixture<InstallmentDetailComponent>;
    let saved: InstallmentSave | undefined;

    const create = (installment: Installment | null) => {
        TestBed.configureTestingModule({
            imports: [InstallmentDetailComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(InstallmentDetailComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('installment', installment);
        fixture.detectChanges();
        saved = undefined;
        component.saveEvent.subscribe(save => saved = save);
    };

    it('should show skeletons while the installment loads', () => {
        create(null);

        expect(fixture.nativeElement.querySelector('p-skeleton')).toBeTruthy();
    });

    it('should have nothing to save after an edit is reverted', () => {
        create(unpaidInstallment);
        const {hasInvoice, paid} = component.detailForm.controls;
        hasInvoice.setValue(true);
        paid.setValue(true);
        hasInvoice.setValue(false);
        paid.setValue(false);

        expect(component.dataChanged).toBeFalse();
        expect(component.newlyPaid).toBeFalse();
    });

    it('should only update the data when Paid is left as it was', () => {
        create(unpaidInstallment);
        component.detailForm.controls.value.setValue(1200);

        component.onSave();

        expect(saved?.paymentDate).toBeUndefined();
        expect(saved?.installment).toEqual(jasmine.objectContaining(
            {value: 1200, paid: false, paymentDate: undefined, note: 'First payment'}));
    });

    it('should only pay when turning Paid on is the only change', () => {
        create(unpaidInstallment);
        component.detailForm.controls.paid.setValue(true);
        component.detailForm.controls.paymentDate.setValue(new Date(2026, 9, 20));

        component.onSave();

        expect(saved).toEqual({installment: undefined, paymentDate: '2026-10-20'});
    });

    it('should update the data and pay when both change', () => {
        create(unpaidInstallment);
        component.detailForm.controls.hasInvoice.setValue(true);
        component.detailForm.controls.paid.setValue(true);
        component.detailForm.controls.paymentDate.setValue(new Date(2026, 9, 20));

        component.onSave();

        expect(saved?.paymentDate).toBe('2026-10-20');
        // The update keeps the installment unpaid; the payment is the separate call
        expect(saved?.installment).toEqual(jasmine.objectContaining({hasInvoice: true, paid: false, paymentDate: undefined}));
    });

    it('should suggest today as the payment date when Paid is turned on', () => {
        create(unpaidInstallment);

        component.detailForm.controls.paid.setValue(true);

        const suggested = component.detailForm.controls.paymentDate.value!;
        expect(component.detailForm.controls.paymentDate.enabled).toBeTrue();
        expect(suggested.toDateString()).toBe(new Date().toDateString());
        // A suggestion past the picker's maxDate is not shown in the input
        expect(suggested.getTime()).toBeLessThanOrEqual(component.latestPaymentDate.getTime());
    });

    it('should keep Paid locked on and send a changed payment date as an update for a paid installment', () => {
        create(paidInstallment);
        component.onEdit();
        fixture.detectChanges();
        expect(component.detailForm.controls.paid.disabled).toBeTrue();
        // The dialog is appended to the body: a fact instead of a switch that can't be used
        expect(document.body.textContent).toContain("A recorded payment can't be undone");
        expect(document.querySelector('#installmentPaid')).toBeNull();

        component.detailForm.controls.paymentDate.setValue(new Date(2026, 9, 16));
        component.onSave();

        expect(saved?.paymentDate).toBeUndefined();
        expect(saved?.installment).toEqual(jasmine.objectContaining({paid: true, paymentDate: '2026-10-16'}));
    });

    it('should keep the payment date of an unpaid installment out of the form', () => {
        create({...unpaidInstallment, paymentDate: undefined});

        expect(component.detailForm.controls.paymentDate.disabled).toBeTrue();
        expect(component.detailForm.valid).toBeTrue();
    });
});
