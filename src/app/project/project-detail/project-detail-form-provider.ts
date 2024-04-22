import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ProjectStatus} from "../../generated/models/project-status";
import {ContractStatus} from "../../generated/models/contract-status";

@Injectable({
    providedIn: 'root'
})
export class ProjectDetailFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getProjectDetailForm(): FormGroup<ProjectCreateForm> {
        let contractForm = this.getProjectContractForm();
        return this.formBuilder.nonNullable.group<ProjectCreateForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            architectId: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            clientId: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            type: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            status: this.formBuilder.nonNullable.control<ProjectStatus>(ProjectStatus.TO_DO, [Validators.required]),
            note: this.formBuilder.control<string>(''),
            contract: contractForm
        });
    }

    private getProjectContractForm(): FormGroup<ProjectContractForm> {
        return this.formBuilder.nonNullable.group<ProjectContractForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            offerValue: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            status: this.formBuilder.nonNullable.control<ContractStatus>(ContractStatus.OFFER, [Validators.required]),
            signingDate: this.formBuilder.nonNullable.control<string>(''),
            startDate: this.formBuilder.nonNullable.control<string>(''),
            endDate: this.formBuilder.nonNullable.control<string>(''),
            deadline: this.formBuilder.nonNullable.control<string>('')
        })
    }
}

export interface ProjectContractForm {
    id: FormControl<number>,
    offerValue: FormControl<number>,
    status: FormControl<ContractStatus>,
    signingDate?: FormControl<string>,
    startDate?: FormControl<string>,
    endDate?: FormControl<string>,
    deadline?: FormControl<string>,
}

export interface ProjectCreateForm {
    id: FormControl<number>,
    name: FormControl<string>,
    architectId: FormControl<number>,
    clientId: FormControl<number>,
    type: FormControl<string>,
    contract: FormGroup<ProjectContractForm>,
    status: FormControl<ProjectStatus>,
    note: FormControl<string | null>
}
