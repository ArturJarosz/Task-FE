import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ContractStatus, ProjectStatus} from "../project";

@Injectable({
    providedIn: 'root'
})
export class ProjectDetailFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getProjectDetailForm(): FormGroup<ProjectCreateForm> {
        let contractForm = this.getProjectContractForm();
        let projectForm =  this.formBuilder.nonNullable.group<ProjectCreateForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            name: this.formBuilder.nonNullable.control<string>('',[Validators.required]),
            architectId: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            clientId: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            type: this.formBuilder.nonNullable.control<string>('',[Validators.required]),
            status: this.formBuilder.nonNullable.control<ProjectStatus>(ProjectStatus.TO_DO, [Validators.required]),
            note: this.formBuilder.control<string>(''),
            contract: contractForm
        });
        return projectForm;
    }

    private getProjectContractForm(): FormGroup<ProjectContractForm> {
        return this.formBuilder.nonNullable.group<ProjectContractForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            offerValue: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            status: this.formBuilder.nonNullable.control<ContractStatus>(ContractStatus.OFFER, [Validators.required]),
            signingDate: this.formBuilder.nonNullable.control<Date>(new Date()),
            startDate: this.formBuilder.nonNullable.control(new Date()),
            endDate: this.formBuilder.nonNullable.control(new Date()),
            deadline: this.formBuilder.nonNullable.control(new Date())
        })
    }
}

export interface ProjectContractForm {
    id: FormControl<number>,
    offerValue: FormControl<number>,
    status: FormControl<ContractStatus>,
    signingDate?: FormControl<Date>,
    startDate?: FormControl<Date>,
    endDate?: FormControl<Date>,
    deadline?: FormControl<Date>,
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
