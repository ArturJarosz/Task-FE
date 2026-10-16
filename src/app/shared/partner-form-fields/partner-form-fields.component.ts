import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

// Name, category, email, phone and note fields shared by the contractor and supplier dialogs.
// The form must have controls: name, category, email, telephone, note.
@Component({
    selector: 'app-partner-form-fields',
    templateUrl: 'partner-form-fields.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    standalone: true,
    imports: [ReactiveFormsModule, NgIf, SelectModule, InputTextModule, Textarea]
})
export class PartnerFormFieldsComponent {
    @Input()
    form!: FormGroup;
    @Input()
    categories: ConfigurationEntry[] | null = [];
    @Input()
    namePlaceholder: string = '';

    // PrimeNG shows the red border only on dirty controls, so a field left empty is marked dirty on blur
    markAsDirty(name: string): void {
        this.form.get(name)?.markAsDirty();
    }

    isFieldInvalid(name: string): boolean {
        let control = this.form.get(name);
        return !!control && control.invalid && (control.touched || control.dirty);
    }
}
