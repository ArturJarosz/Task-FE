import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditSystemParameterComponent} from './edit-system-parameter.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {SystemParameter} from '../../generated/models/system-parameter';

describe('EditSystemParameterComponent', () => {
    let component: EditSystemParameterComponent;
    let fixture: ComponentFixture<EditSystemParameterComponent>;

    const vatTax: SystemParameter = {id: 1, name: 'Vat tax', type: 'DECIMAL_NUMBER', value: '0.23', defaultValue: '0.2'};

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditSystemParameterComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(EditSystemParameterComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('systemParameter', vatTax);
        fixture.detectChanges();
    });

    it('should save a numeric value as a string', () => {
        let saved: SystemParameter | undefined;
        component.save.subscribe(parameter => saved = parameter);

        component.numberValue.setValue(0.08);
        component.onSave();

        expect(saved).toEqual({...vatTax, value: '0.08'});
    });

    it('should save on Enter without a native form submit', () => {
        let saveSpy = jasmine.createSpy('save');
        component.save.subscribe(saveSpy);
        let submit = new Event('submit', {cancelable: true});

        document.querySelector('form')!.dispatchEvent(submit);

        expect(submit.defaultPrevented).toBeTrue();
        expect(saveSpy).toHaveBeenCalled();
    });

    it('should reset to the default value', () => {
        component.onResetToDefault();

        expect(component.numberValue.value).toBe(0.2);
    });

    it('should not save an empty value', () => {
        let saveSpy = jasmine.createSpy('save');
        component.save.subscribe(saveSpy);

        component.numberValue.setValue(null);
        component.onSave();

        expect(saveSpy).not.toHaveBeenCalled();
    });
});
