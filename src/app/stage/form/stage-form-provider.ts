import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {StageStatus} from "../../generated/models/stage-status";
import {StageType} from "../../generated/models/stage-type";

const DEFAULT_TYPE: StageType = StageType.VISUALISATIONS;
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
            type: this.formBuilder.nonNullable.control<StageType>(DEFAULT_TYPE, [Validators.required]),
            status: this.formBuilder.nonNullable.control<StageStatus>(StageStatus.TO_DO, [Validators.required]),
            startDate: this.formBuilder.nonNullable.control(new Date()),
            deadline: this.formBuilder.nonNullable.control(new Date()),
            endDate: this.formBuilder.nonNullable.control(new Date()),
            note: this.formBuilder.control<string>('')
        })
    };

    public getAddStageForm(): FormGroup<AddStageForm> {
        return this.formBuilder.nonNullable.group<AddStageForm>({
            name: this.formBuilder.nonNullable.control<string>('',[Validators.required]),
            deadline: this.formBuilder.nonNullable.control<Date>(new Date()),
            type: this.formBuilder.nonNullable.control<StageType>(DEFAULT_TYPE),
            note: this.formBuilder.control('')
        })
    }
}

export interface StageForm {
    id: FormControl<number>,
    name: FormControl<string>,
    type: FormControl<StageType>,
    status: FormControl<StageStatus>,
    startDate: FormControl<Date>,
    deadline: FormControl<Date>,
    endDate: FormControl<Date>,
    note: FormControl<string | null>
}

export interface AddStageForm {
    name: FormControl<string>,
    deadline: FormControl<Date>,
    type: FormControl<StageType>,
    note: FormControl<string | null>
}
