import {ChangeDetectionStrategy, Component, computed, effect, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AddTaskForm, TaskFormProvider} from "../form/task-form-provider";
import {Task} from "../../generated/models/task";
import {ArchitectStore} from "../../architect/state/architect.state";
import {ProjectStore} from "../../project/state/project.state";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-task',
    templateUrl: './add-task.component.html',
    styleUrl: './add-task.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
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

    header: string = "New task";

    readonly taskStore = inject(TaskStore);
    readonly configurationStore = inject(ConfigurationStore);
    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);
    $taskTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskTypes;
    $architectOptions = computed(() => this.architectStore.architects()
        .map(architect => ({id: architect.id!, name: `${architect.firstName} ${architect.lastName}`})));

    addTaskForm!: FormGroup<AddTaskForm>;

    constructor(private formProvider: TaskFormProvider) {
        effect(() => {
            this.projectStore.project();
            this.prefillArchitect();
        });
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
        this.resetFields();
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
        this.taskStore.createTask({projectId: this.projectId, stageId: this.stageId, task: this.createTask()});
    }

    markAsDirty(path: string): void {
        this.addTaskForm.get(path)?.markAsDirty();
    }

    isFieldInvalid(path: string): boolean {
        const control = this.addTaskForm.get(path);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    isSaveEnabled(): boolean {
        return this.addTaskForm.valid;
    }

    private createTask(): Task {
        const value = this.addTaskForm.getRawValue();
        return {
            name: value.name,
            type: value.type,
            note: value.note ?? undefined,
            architectId: value.architectId ?? undefined,
        };
    }

    private resetFields(): void {
        this.addTaskForm = this.formProvider.getAddTaskForm();
        this.prefillArchitect();
    }

    private prefillArchitect(): void {
        const architectId = this.projectStore.project()?.architect?.id;
        if (architectId && this.addTaskForm) {
            this.addTaskForm.patchValue({architectId});
        }
    }
}
