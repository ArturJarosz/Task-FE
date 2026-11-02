import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {StageStatus} from "../../generated/models/stage-status";

const DEFAULT_STATUS: StageStatus = StageStatus.TO_DO;

@Injectable({
    providedIn: 'root'
})
export class StageFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getStageDetailForm(): FormGroup<StageForm> {
        return this.formBuilder.nonNullable.group<StageForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            // id of the stage type as a string, the way configuration entries hold it
            type: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            status: this.formBuilder.nonNullable.control<StageStatus>(DEFAULT_STATUS, [Validators.required]),
            startDate: this.formBuilder.control<Date | null>(null),
            deadline: this.formBuilder.control<Date | null>(null),
            endDate: this.formBuilder.control<Date | null>(null),
            note: this.formBuilder.control<string>(''),
            architectId: this.formBuilder.control<number | null>(null, [Validators.required])
        })
    };

    public getAddStageForm(): FormGroup<AddStageForm> {
        return this.formBuilder.nonNullable.group<AddStageForm>({
            name: this.formBuilder.nonNullable.control<string>('',[Validators.required]),
            deadline: this.formBuilder.nonNullable.control<Date>(new Date()),
            // id of the stage type as a string, the way configuration entries hold it
            type: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            note: this.formBuilder.control<string>(''),
            architectId: this.formBuilder.control<number | null>(null, [Validators.required]),
            hasInstallment: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            installmentValue: this.formBuilder.control<number>(0),
            hasInvoice: this.formBuilder.control<boolean>(true, [Validators.required]),
            paid: this.formBuilder.control<boolean>(false, [Validators.required]),
            paymentDate: this.formBuilder.control<Date | null>(null),
        })
    }
}

export interface StageForm {
    id: FormControl<number>,
    name: FormControl<string>,
    type: FormControl<string>,
    status: FormControl<StageStatus>,
    startDate: FormControl<Date | null>,
    deadline: FormControl<Date | null>,
    endDate: FormControl<Date | null>,
    note: FormControl<string | null>,
    architectId: FormControl<number | null>
}

export interface AddStageForm {
    name: FormControl<string>,
    deadline: FormControl<Date>,
    type: FormControl<string>,
    note: FormControl<string | null>,
    architectId: FormControl<number | null>,
    hasInstallment: FormControl<boolean>,
    installmentValue?: FormControl<number | null>,
    hasInvoice?: FormControl<boolean | null>,
    paid?: FormControl<boolean | null>,
    paymentDate?: FormControl<Date | null>
}
