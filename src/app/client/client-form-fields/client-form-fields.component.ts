import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {ClientType, ConfigurationEntry} from "../../generated/models";
import {ClientForm} from "../form/client-form-provider";

// The client fields shared by the "New client" and "Edit client" dialogs (2-column grid)
@Component({
    selector: 'client-form-fields',
    templateUrl: './client-form-fields.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    standalone: true,
    imports: [ReactiveFormsModule, NgIf, SelectModule, InputTextModule, Textarea]
})
export class ClientFormFieldsComponent {
    @Input()
    form!: FormGroup<ClientForm>;
    @Input()
    clientTypes: ConfigurationEntry[] | null = [];

    protected readonly ClientType = ClientType;

    // PrimeNG shows the red border only on dirty controls, so a field left empty is marked dirty on blur
    markAsDirty(name: string): void {
        this.form.get(name)?.markAsDirty();
    }

    isFieldInvalid(name: string): boolean {
        let control = this.form.get(name);
        return !!control && control.invalid && (control.touched || control.dirty);
    }
}
