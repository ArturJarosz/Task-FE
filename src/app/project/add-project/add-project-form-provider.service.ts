import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class AddProjectFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getAddProjectForm(): FormGroup<AddProjectForm> {
        return this.formBuilder.nonNullable.group<AddProjectForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            architectId: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            clientId: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            type: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            offerValue: this.formBuilder.nonNullable.control<number>(0, [Validators.required])
        })
    }
}

interface AddProjectForm {
    name: FormControl<string>,
    architectId: FormControl<number>,
    clientId: FormControl<number>,
    type: FormControl<string>,
    offerValue: FormControl<number>
}
