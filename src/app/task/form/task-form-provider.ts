import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskStatus} from "../../generated/models/task-status";

const DEFAULT_STATUS = TaskStatus.TO_DO;

@Injectable({
    providedIn: 'root'
})
export class TaskFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getTaskDetailForm(): FormGroup<TaskForm> {
        return this.formBuilder.nonNullable.group<TaskForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            startDate: this.formBuilder.control<Date | null>(null),
            endDate: this.formBuilder.control<Date | null>(null),
            status: this.formBuilder.nonNullable.control<TaskStatus>(DEFAULT_STATUS),
            // id of the task type as a string, the way configuration entries hold it
            type: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            note: this.formBuilder.control<string | null>(''),
            architectId: this.formBuilder.control<number | null>(null, [Validators.required])
        });
    };

    public getAddTaskForm(): FormGroup<AddTaskForm> {
        return this.formBuilder.nonNullable.group<AddTaskForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            startDate: this.formBuilder.control<Date>(new Date()),
            // id of the task type as a string, the way configuration entries hold it
            type: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            note: this.formBuilder.control(''),
            architectId: this.formBuilder.control<number | null>(null, [Validators.required])
        })
    }
}

export interface TaskForm {
    id: FormControl<number>;
    name: FormControl<string>;
    startDate: FormControl<Date | null>,
    endDate: FormControl<Date | null>;
    status: FormControl<TaskStatus>,
    type: FormControl<string>,
    note: FormControl<string | null>,
    architectId: FormControl<number | null>
}

export interface AddTaskForm {
    name: FormControl<string>,
    startDate: FormControl<Date | null>,
    type: FormControl<string>,
    note: FormControl<string | null>,
    architectId: FormControl<number | null>
}


