import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {Subscription} from "rxjs";
import {Store} from "@ngrx/store";
import {ConfigurationState, getTaskTypeConfiguration, loadConfiguration} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {TaskFormProvider} from "../form/task-form-provider";
import {Task} from "../../generated/models/task";

@Component({
    selector: 'add-task',
    templateUrl: './add-task.component.html',
    styleUrl: './add-task.component.less'
})
export class AddTaskComponent implements OnInit, OnDestroy {
    @Input()
    visible = false;
    @Input()
    projectId!: number;
    @Input()
    stageId!: number;

    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new task";

    readonly taskStore = inject(TaskStore);

    taskTypesSubscription!: Subscription;
    taskTypes!: ConfigurationEntry[];
    addTaskForm!: FormGroup;

    constructor(private configurationStore: Store<ConfigurationState>, private formProvider: TaskFormProvider) {

    }

    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.taskTypesSubscription = this.configurationStore.select(getTaskTypeConfiguration)
            .subscribe({
                next: taskTypes => this.taskTypes = taskTypes
            })

        this.addTaskForm = this.formProvider.getAddTaskForm();
    }

    ngOnDestroy(): void {
        this.taskTypesSubscription.unsubscribe();
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onCancel(): void {
        this.visible = false;
        this.resetFields();
    }

    onSave(): void {
        this.visible = false;
        let task: Task = this.createTask();
        this.taskStore.createTask({projectId: this.projectId, stageId: this.stageId, task: task});
    }

    private createTask(): Task {
        let task: Task;
        task = {
            name: this.addTaskForm.get('name')?.value,
            type: this.addTaskForm.get('type')?.value,
            note: this.addTaskForm.get('note')?.value,
        };

        return task;
    }

    isSaveEnabled(): boolean {
        return this.addTaskForm.valid;
    }

    private resetFields(): void {
        this.addTaskForm = this.formProvider.getAddTaskForm();
    }

}
