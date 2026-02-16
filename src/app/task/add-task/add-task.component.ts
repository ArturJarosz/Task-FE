import {Component, EventEmitter, effect, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {TaskFormProvider} from "../form/task-form-provider";
import {Task} from "../../generated/models/task";
import {ArchitectStore} from "../../architect/state/architect.state";
import {ProjectStore} from "../../project/state/project.state";
import {Architect} from "../../generated/models/architect";

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
    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);
    $taskTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskTypes;
    $architects: Signal<Architect[]> = this.architectStore.architects;

    addTaskForm!: FormGroup;

    constructor(private formProvider: TaskFormProvider) {
        effect(() => {
            const project = this.projectStore.project();
            if (project?.architect?.id && this.addTaskForm) {
                this.addTaskForm.patchValue({
                    architectId: project.architect.id
                });
            }
        });
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
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
            architectId: this.addTaskForm.get('architectId')?.value,
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
