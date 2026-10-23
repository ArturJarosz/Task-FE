import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {InputNumberModule} from "primeng/inputnumber";
import {SystemParameter} from "../../generated/models/system-parameter";
import {formatParameterValue, isNumericParameter, SystemParameterType} from "../system-parameter-format";

@Component({
    selector: 'edit-system-parameter',
    templateUrl: './edit-system-parameter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule, InputNumberModule, ReactiveFormsModule]
})
export class EditSystemParameterComponent implements OnChanges {
    // The dialog is open while a parameter is set
    @Input()
    systemParameter: SystemParameter | null = null;

    @Output()
    save = new EventEmitter<SystemParameter>();
    @Output()
    closed = new EventEmitter<void>();

    readonly textValue = new FormControl<string>('', {nonNullable: true, validators: [Validators.required]});
    readonly numberValue = new FormControl<number | null>(null, {validators: [Validators.required]});

    get visible(): boolean {
        return this.systemParameter !== null;
    }

    get isNumeric(): boolean {
        return isNumericParameter(this.systemParameter?.type);
    }

    get maxFractionDigits(): number {
        return this.systemParameter?.type === SystemParameterType.DECIMAL_NUMBER ? 4 : 0;
    }

    get valueControl(): FormControl {
        return this.isNumeric ? this.numberValue : this.textValue;
    }

    get defaultValueText(): string {
        let defaultValue = this.systemParameter?.defaultValue;
        return defaultValue ? formatParameterValue(defaultValue, this.systemParameter?.type) : '';
    }

    ngOnChanges(): void {
        this.setValue(this.systemParameter?.value ?? '');
    }

    onResetToDefault(): void {
        this.setValue(this.systemParameter?.defaultValue ?? '');
        this.valueControl.markAsDirty();
    }

    onSave(): void {
        if (this.valueControl.invalid) {
            this.valueControl.markAsDirty();
            return;
        }
        let value = this.isNumeric ? String(this.numberValue.value) : this.textValue.value.trim();
        this.save.emit({...this.systemParameter!, value: value});
    }

    onHide(): void {
        this.closed.emit();
    }

    private setValue(value: string): void {
        let number = value.trim() === '' ? NaN : Number(value);
        this.numberValue.reset(isNaN(number) ? null : number);
        this.textValue.reset(value);
    }
}
