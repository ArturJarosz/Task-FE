import {Component, computed, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Task} from "../../generated/models/task";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {FormGroup} from "@angular/forms";
import {TaskDetailFormProvider, TaskForm} from "../form/task-detail-form-provider";

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

    $resolvedTypeLabel = computed(() => {
        if (this.task?.type) {
            return resolveLabel(this.task.type, this.taskTypes);
        }
        return "";
    })

    $resolvedStatusLabel = computed(() => {
        if (this.task?.status) {
            return resolveLabel(this.task.status, this.taskStatuses);
        }
        return "";
    })

    taskDetailForm!: FormGroup<TaskForm>;

    constructor(private formProvider: TaskDetailFormProvider) {
    }

    ngOnInit(): void {
        this.taskDetailForm = this.formProvider.getTaskDetailForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['task'] && this.task) {
            this.taskDetailForm = this.formProvider.getTaskDetailForm();
            this.fillFormData();
        }
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

}
