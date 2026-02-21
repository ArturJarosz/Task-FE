import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CostDetailComponent} from './cost-detail.component';
import {CostDetailFormProvider} from './cost-detail-form-provider';
import {ReactiveFormsModule} from '@angular/forms';
import {Cost} from '../../../generated/models/cost';
import {CostCategory} from '../../../generated/models/cost-category';
import {ConfigurationEntry} from '../../../generated/models/configuration-entry';
import {SimpleChange, NO_ERRORS_SCHEMA} from '@angular/core';
import {SelectModule} from 'primeng/select';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {DatePickerModule} from 'primeng/datepicker';
import {InputNumberModule} from 'primeng/inputnumber';

const MOCK_COST: Cost = {
    id: 1,
    name: 'Test Cost',
    date: '2025-03-15',
    category: CostCategory.FUEL,
    value: 150.50,
    note: 'Test note',
    hasInvoice: true,
    paid: true,
    payable: true
};

const MOCK_COST_CATEGORIES: ConfigurationEntry[] = [
    {id: CostCategory.FUEL, label: 'Fuel'},
    {id: CostCategory.MISTAKE, label: 'Mistake'}
];

describe('CostDetailComponent', () => {
    let component: CostDetailComponent;
    let fixture: ComponentFixture<CostDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                SelectModule,
                ToggleSwitchModule,
                DatePickerModule,
                InputNumberModule
            ],
            declarations: [CostDetailComponent],
            providers: [CostDetailFormProvider],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CostDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.cost = null;
        component.costCategories = [];
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize the form', () => {
            component.cost = null;
            component.costCategories = [];
            fixture.detectChanges();

            expect(component.costDetailsForm).toBeTruthy();
            expect(component.initialCostDetailsForm).toBeTruthy();
        });

        it('should fill form data when cost is provided', () => {
            component.cost = MOCK_COST;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();

            expect(component.costDetailsForm.value.name).toBe('Test Cost');
            expect(component.costDetailsForm.value.category).toBe(CostCategory.FUEL);
            expect(component.costDetailsForm.value.value).toBe(150.50);
            expect(component.costDetailsForm.value.note).toBe('Test note');
            expect(component.costDetailsForm.value.hasInvoice).toBe(true);
            expect(component.costDetailsForm.value.paid).toBe(true);
        });

        it('should not fill form data when cost is null', () => {
            component.cost = null;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();

            expect(component.costDetailsForm.value.name).toBe('');
            expect(component.costDetailsForm.value.value).toBe(0);
        });

        it('should set initial form as clone of cost details form', () => {
            component.cost = MOCK_COST;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();

            expect(JSON.stringify(component.initialCostDetailsForm.value))
                .toBe(JSON.stringify(component.costDetailsForm.value));
        });
    });

    describe('ngOnChanges', () => {
        beforeEach(() => {
            component.cost = null;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();
        });

        it('should update form when cost input changes', () => {
            component.cost = MOCK_COST;
            component.ngOnChanges({
                cost: new SimpleChange(null, MOCK_COST, false)
            });

            expect(component.costDetailsForm.value.name).toBe('Test Cost');
            expect(component.costDetailsForm.value.hasInvoice).toBe(true);
            expect(component.costDetailsForm.value.paid).toBe(true);
        });

        it('should not update form when cost is null', () => {
            component.cost = null;
            component.ngOnChanges({
                cost: new SimpleChange(MOCK_COST, null, false)
            });

            expect(component.costDetailsForm.value.name).toBe('');
        });

        it('should update initial form snapshot on changes', () => {
            component.cost = MOCK_COST;
            component.ngOnChanges({
                cost: new SimpleChange(null, MOCK_COST, false)
            });

            expect(JSON.stringify(component.initialCostDetailsForm.value))
                .toBe(JSON.stringify(component.costDetailsForm.value));
        });
    });

    describe('isFormChanged', () => {
        beforeEach(() => {
            component.cost = MOCK_COST;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();
        });

        it('should return false when form is pristine', () => {
            expect(component.isFormChanged()).toBe(false);
        });

        it('should return false when form is dirty but values are the same', () => {
            component.costDetailsForm.controls.name.markAsDirty();
            expect(component.isFormChanged()).toBe(false);
        });

        it('should return true when form value has changed', () => {
            component.costDetailsForm.controls.name.setValue('Changed Name');
            component.costDetailsForm.controls.name.markAsDirty();
            expect(component.isFormChanged()).toBe(true);
        });

        it('should return true when boolean paid is toggled', () => {
            const currentPaid = component.costDetailsForm.controls.paid.value;
            component.costDetailsForm.controls.paid.setValue(!currentPaid);
            component.costDetailsForm.controls.paid.markAsDirty();
            expect(component.isFormChanged()).toBe(true);
        });

        it('should return true when boolean hasInvoice is toggled', () => {
            const currentHasInvoice = component.costDetailsForm.controls.hasInvoice.value;
            component.costDetailsForm.controls.hasInvoice.setValue(!currentHasInvoice);
            component.costDetailsForm.controls.hasInvoice.markAsDirty();
            expect(component.isFormChanged()).toBe(true);
        });
    });

    describe('onSave', () => {
        beforeEach(() => {
            component.cost = MOCK_COST;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();
        });

        it('should emit updateCostEvent with form values', () => {
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            expect(component.updateCostEvent.emit).toHaveBeenCalledTimes(1);
            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.name).toBe('Test Cost');
            expect(emittedCost.category).toBe(CostCategory.FUEL);
            expect(emittedCost.value).toBe(150.50);
            expect(emittedCost.note).toBe('Test note');
            expect(emittedCost.payable).toBe(true);
        });

        it('should emit correct boolean values when paid is true', () => {
            component.costDetailsForm.controls.paid.setValue(true);
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.paid).toBe(true);
        });

        it('should emit correct boolean values when paid is false', () => {
            component.costDetailsForm.controls.paid.setValue(false);
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.paid).toBe(false);
        });

        it('should emit correct boolean values when hasInvoice is true', () => {
            component.costDetailsForm.controls.hasInvoice.setValue(true);
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.hasInvoice).toBe(true);
        });

        it('should emit correct boolean values when hasInvoice is false', () => {
            component.costDetailsForm.controls.hasInvoice.setValue(false);
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.hasInvoice).toBe(false);
        });

        it('should emit updated values after form changes', () => {
            component.costDetailsForm.controls.name.setValue('Updated Name');
            component.costDetailsForm.controls.value.setValue(999.99);
            component.costDetailsForm.controls.paid.setValue(false);
            component.costDetailsForm.controls.hasInvoice.setValue(false);
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.name).toBe('Updated Name');
            expect(emittedCost.value).toBe(999.99);
            expect(emittedCost.paid).toBe(false);
            expect(emittedCost.hasInvoice).toBe(false);
        });

        it('should always set payable to true', () => {
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.payable).toBe(true);
        });

        it('should emit date as formatted string', () => {
            spyOn(component.updateCostEvent, 'emit');

            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.date).toBeDefined();
            expect(typeof emittedCost.date).toBe('string');
        });
    });

    describe('form data filling with edge cases', () => {
        beforeEach(() => {
            component.cost = null;
            component.costCategories = MOCK_COST_CATEGORIES;
            fixture.detectChanges();
        });

        it('should handle cost with paid=false correctly', () => {
            const costWithPaidFalse: Cost = {...MOCK_COST, paid: false};
            component.cost = costWithPaidFalse;
            component.ngOnChanges({
                cost: new SimpleChange(null, costWithPaidFalse, false)
            });

            expect(component.costDetailsForm.value.paid).toBe(false);
        });

        it('should handle cost with hasInvoice=false correctly', () => {
            const costWithNoInvoice: Cost = {...MOCK_COST, hasInvoice: false};
            component.cost = costWithNoInvoice;
            component.ngOnChanges({
                cost: new SimpleChange(null, costWithNoInvoice, false)
            });

            expect(component.costDetailsForm.value.hasInvoice).toBe(false);
        });

        it('should handle cost with both booleans false correctly', () => {
            const costBothFalse: Cost = {...MOCK_COST, paid: false, hasInvoice: false};
            component.cost = costBothFalse;
            component.ngOnChanges({
                cost: new SimpleChange(null, costBothFalse, false)
            });

            expect(component.costDetailsForm.value.paid).toBe(false);
            expect(component.costDetailsForm.value.hasInvoice).toBe(false);
        });

        it('should preserve boolean values after toggling and saving', () => {
            component.cost = {...MOCK_COST, paid: false, hasInvoice: false};
            component.ngOnChanges({
                cost: new SimpleChange(null, component.cost, false)
            });

            component.costDetailsForm.controls.paid.setValue(true);
            component.costDetailsForm.controls.hasInvoice.setValue(true);

            spyOn(component.updateCostEvent, 'emit');
            component.onSave();

            const emittedCost: Cost = (component.updateCostEvent.emit as jasmine.Spy).calls.first().args[0];
            expect(emittedCost.paid).toBe(true);
            expect(emittedCost.hasInvoice).toBe(true);
        });
    });
});
