import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CostDetailComponent} from './cost-detail.component';
import {Cost} from '../../../generated/models/cost';
import {ConfigurationEntry} from '../../../generated/models/configuration-entry';
import {provideTestDependencies} from '../../../../testing/test-providers';

const MOCK_COST: Cost = {
    id: 1,
    name: 'Test Cost',
    date: '2025-03-15',
    categoryId: 100,
    value: 150.50,
    note: 'Test note',
    hasInvoice: true,
    paid: true,
    payable: true
};

const MOCK_COST_CATEGORIES: ConfigurationEntry[] = [
    {id: '100', label: 'Fuel'},
    {id: '101', label: 'Mistake'}
];

describe('CostDetailComponent', () => {
    let component: CostDetailComponent;
    let fixture: ComponentFixture<CostDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CostDetailComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(CostDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create without a cost', () => {
        component.costCategories = MOCK_COST_CATEGORIES;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should fill the form and the category label from the cost', () => {
        // setInput runs ngOnChanges, which resolves the category label
        fixture.componentRef.setInput('cost', MOCK_COST);
        fixture.componentRef.setInput('costCategories', MOCK_COST_CATEGORIES);
        fixture.detectChanges();

        expect(component.costDetailsForm.value.name).toBe('Test Cost');
        expect(component.costDetailsForm.value.category).toBe('100');
        expect(component.costDetailsForm.value.value).toBe(150.50);
        expect(component.costDetailsForm.value.note).toBe('Test note');
        expect(component.categoryLabel).toBe('Fuel');
    });

    it('should enable the payment date only when the cost is paid', () => {
        component.cost = {...MOCK_COST, paid: false};
        component.costCategories = MOCK_COST_CATEGORIES;
        fixture.detectChanges();
        expect(component.costDetailsForm.controls.paymentDate.disabled).toBe(true);

        component.costDetailsForm.controls.paid.setValue(true);
        expect(component.costDetailsForm.controls.paymentDate.enabled).toBe(true);
    });

    describe('dataNeedsUpdate', () => {
        beforeEach(() => {
            component.cost = MOCK_COST;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();
        });

        it('should be false while the form is unchanged', () => {
            expect(component.dataNeedsUpdate).toBe(false);
        });

        it('should be true after a field changes', () => {
            component.costDetailsForm.controls.name.setValue('Changed name');
            expect(component.dataNeedsUpdate).toBe(true);
        });
    });

    describe('onSave', () => {
        beforeEach(() => {
            component.cost = MOCK_COST;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();
        });

        it('should emit the form values with payable set to true', () => {
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emitted: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emitted.name).toBe('Test Cost');
            expect(emitted.categoryId).toBe(100);
            expect(emitted.value).toBe(150.50);
            expect(emitted.note).toBe('Test note');
            expect(emitted.payable).toBe(true);
            expect(typeof emitted.date).toBe('string');
        });

        it('should send a payment date only when the cost is paid', () => {
            spyOn(component.updateCostEvent, 'emit');

            component.costDetailsForm.controls.paid.setValue(false);
            component.onSave();

            const emitted: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emitted.paid).toBe(false);
            expect(emitted.paymentDate).toBeUndefined();
        });
    });

    describe('onCancelEdit', () => {
        it('should restore the saved values', () => {
            component.cost = MOCK_COST;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();

            component.showEditDialog = true;
            component.costDetailsForm.controls.name.setValue('Changed name');
            component.onCancelEdit();

            expect(component.showEditDialog).toBe(false);
            expect(component.costDetailsForm.value.name).toBe('Test Cost');
        });
    });
});
