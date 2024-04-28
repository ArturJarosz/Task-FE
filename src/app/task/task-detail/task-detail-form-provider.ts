import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskStatus} from "../../generated/models/task-status";
import {TaskType} from "../../generated/models/task-type";

const DEFAULT_STATUS = TaskStatus.TO_DO;
const DEFAULT_TYPE = TaskType.CONCEPT;

@Injectable({
    providedIn: 'root'
})
export class TaskDetailFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getTaskDetailForm(): FormGroup<TaskForm> {
        return this.formBuilder.nonNullable.group<TaskForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            startDate: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            endDate: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            status: this.formBuilder.nonNullable.control<TaskStatus>(DEFAULT_STATUS),
            type: this.formBuilder.nonNullable.control<TaskType>(DEFAULT_TYPE),
            note: this.formBuilder.nonNullable.control('')
        });
    }
}

export interface TaskForm {
    id: FormControl<number>;
    name: FormControl<string>;
    startDate: FormControl<string>,
    endDate: FormControl<string>;
    status: FormControl<TaskStatus>,
    type: FormControl<TaskType>,
    note: FormControl<string>

}


