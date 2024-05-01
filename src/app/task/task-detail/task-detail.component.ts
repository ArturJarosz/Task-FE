import {Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Task} from "../../generated/models/task";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {FormGroup} from "@angular/forms";
import {TaskDetailFormProvider, TaskForm} from "../form/task-detail-form-provider";
import {TaskStatus} from "../../generated/models/task-status";
import {cloneDeep} from "lodash";
import {UpdateTaskDto} from "../model/task";

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

    constructor(private formProvider: TaskDetailFormProvider) {
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
            startDate: this.task.startDate,
            endDate: this.task.endDate,
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

    createTask(): Task {
        let task: Task = {};
        task.status = this.taskDetailForm.value.status;
        task.name = this.taskDetailForm.value.name;
        task.startDate = this.taskDetailForm.value.startDate;
        task.endDate = this.taskDetailForm.value.endDate;
        task.type = this.taskDetailForm.value.type;
        task.note = this.taskDetailForm.value.note;
        return task;
    }

}
