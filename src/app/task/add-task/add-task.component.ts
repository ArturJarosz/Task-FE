import {Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {TaskFormProvider} from "../form/task-form-provider";
import {Task} from "../../generated/models/task";

@Component({
    selector: 'add-task',
    templateUrl: './add-task.component.html',
    styleUrl: './add-task.component.less'
})
export class AddTaskComponent implements OnInit {
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
    readonly configurationStore = inject(ConfigurationStore);
    $taskTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageTypes;

    addTaskForm!: FormGroup;

    constructor(private formProvider: TaskFormProvider) {

    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.addTaskForm = this.formProvider.getAddTaskForm();
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
