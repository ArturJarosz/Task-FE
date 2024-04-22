import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {StageStatus} from "../../generated/models/stage-status";

@Injectable({
    providedIn: 'root'
})
export class StageDetailFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getStageDetailForm(): FormGroup<StageForm> {
        return this.formBuilder.nonNullable.group<StageForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            type: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            status: this.formBuilder.nonNullable.control<StageStatus>(StageStatus.TO_DO, [Validators.required]),
            startDate: this.formBuilder.nonNullable.control(new Date()),
            deadline: this.formBuilder.nonNullable.control(new Date()),
            endDate: this.formBuilder.nonNullable.control(new Date()),
            note: this.formBuilder.control<string>('')
        })
    }
}

export interface StageForm {
    id: FormControl<number>,
    name: FormControl<string>,
    type: FormControl<string>,
    status: FormControl<StageStatus>,
    startDate: FormControl<Date>,
    deadline: FormControl<Date>,
    endDate: FormControl<Date>,
    note: FormControl<string | null>
}
