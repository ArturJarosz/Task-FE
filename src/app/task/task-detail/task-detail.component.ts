import {Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Task} from "../../generated/models/task";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {FormGroup} from "@angular/forms";
import {TaskFormProvider, TaskForm} from "../form/task-form-provider";
import {TaskStatus} from "../../generated/models/task-status";
import {cloneDeep} from "lodash";
import {DeleteTaskDto, UpdateTaskDto} from "../model/task";
import {toDateIfExists, toTimeZoneString} from "../../shared/utils/date-utils";

@Component({
    selector: 'task-detail',
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.less'
})
export class TaskDetailComponent implements OnInit, OnChanges {
    @Input()
    task!: Task | null;
    @Input()
    taskTypes!: ConfigurationEntry[] | null;
    @Input()
    taskStatuses!: ConfigurationEntry[] | null;
    @Output()
    updateStatusEvent: EventEmitter<UpdateTaskDto> = new EventEmitter<UpdateTaskDto>();
    @Output()
    deleteTaskEVent: EventEmitter<DeleteTaskDto> = new EventEmitter<DeleteTaskDto>();

    availableTaskStatuses!: ConfigurationEntry[];

    $resolvedTypeLabel = computed(() => {
        if (this.task?.type) {
            return resolveLabel(this.task.type, this.taskTypes);
        }
        return "";
    })

    taskDetailForm!: FormGroup<TaskForm>;
    initialTaskDetailForm!: FormGroup<TaskForm>;
    fieldsToUpdate: string[] = ["name", "type", "startDate", "endDate", "note"];

    constructor(private formProvider: TaskFormProvider) {
    }

    ngOnInit(): void {
        this.taskDetailForm = this.formProvider.getTaskDetailForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['task'] && this.task) {
            this.taskDetailForm = this.formProvider.getTaskDetailForm();
            this.fillFormData();
            this.initialTaskDetailForm = cloneDeep(this.taskDetailForm) as FormGroup<TaskForm>;
            this.resolveAvailableStatuses();
        }
    }

    statusNeedsUpdate(): boolean {

        return this.initialTaskDetailForm.value.status as TaskStatus != this.taskDetailForm.value.status;
    }

    dataNeedUpdate(): boolean {
        return this.fieldsToUpdate.filter(fieldName => {
                return this.initialTaskDetailForm.get(fieldName)?.value !== this.taskDetailForm.get(fieldName)?.value
            }
        ).length > 0;
    }

    isUpdated(): boolean {
        return this.dataNeedUpdate() || this.statusNeedsUpdate();
    }

    private fillFormData() {
        if (!this.task || this.taskDetailForm === undefined) {
            return;
        }
        this.taskDetailForm.patchValue({
            id: this.task.id,
            name: this.task.name,
            startDate: toDateIfExists(this.task.startDate!),
            endDate: toDateIfExists(this.task.endDate!),
            status: this.task.status,
            type: this.task.type,
            note: this.task.note
        })
    }

    private resolveAvailableStatuses() {
        this.availableTaskStatuses = [];
        let currentStatus = this.taskStatuses!.find(status => status.id === this.task!.status);
        if (currentStatus) {
            this.availableTaskStatuses?.push(currentStatus);
        }
        if (this.taskStatuses && this.task) {
            this.taskStatuses.filter(
                status => {
                    let index = this.task?.nextStatuses?.indexOf(
                        TaskStatus[status.id as keyof typeof TaskStatus])
                    return index !== -1;
                })
                .forEach(status => this.availableTaskStatuses.push(status));
        }
    }

    onSave(): void {
        let task = this.createTask();
        let updateStatusDto: UpdateTaskDto = {
            task: task,
            updateData: false,
            updateStatus: false
        };
        if (this.statusNeedsUpdate()) {
            updateStatusDto.updateStatus = true;
        }
        if (this.dataNeedUpdate()) {
            updateStatusDto.updateData = true;
        }
        this.updateStatusEvent.emit(updateStatusDto);
    }

    onDelete(): void {
        this.deleteTaskEVent.emit({taskName: this.task!.name!, taskId: this.task!.id!});
    }

    createTask(): Task {
        let task: Task = {};
        task.status = this.taskDetailForm.value.status;
        task.name = this.taskDetailForm.value.name;
        task.startDate = toTimeZoneString(this.taskDetailForm.value.startDate);
        task.endDate = toTimeZoneString(this.taskDetailForm.value.endDate);
        task.type = this.taskDetailForm.value.type;
        task.note = this.taskDetailForm.value.note;
        return task;
    }

}
