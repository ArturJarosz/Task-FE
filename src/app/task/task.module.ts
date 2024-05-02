import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TaskListComponent} from './task-list/task-list.component';
import {TaskListShellComponent} from './task-list-shell/task-list-shell.component';
import {TableModule} from "primeng/table";
import {TaskDetailComponent} from './task-detail/task-detail.component';
import {TaskDetailShellComponent} from './task-detail-shell/task-detail-shell.component';
import {RouterModule} from "@angular/router";
import {SharedModule} from "../shared/shared.module";
import {TaskRestService, TaskRestServiceImpl} from "./rest/task-rest.service";
import {AccordionModule} from "primeng/accordion";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {InputTextareaModule} from "primeng/inputtextarea";
import { AddTaskComponent } from './add-task/add-task.component';
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {RippleModule} from "primeng/ripple";


@NgModule({
    declarations: [
        TaskListComponent,
        TaskListShellComponent,
        TaskDetailComponent,
        TaskDetailShellComponent,
        AddTaskComponent
    ],
    exports: [
        TaskListShellComponent
    ],
    imports: [
        CommonModule,
        TableModule,
        RouterModule.forChild([
            {path: 'projects/:projectId/stages/:stageId/tasks/:taskId', component: TaskDetailShellComponent},
        ]),
        SharedModule,
        AccordionModule,
        InputTextModule,
        CalendarModule,
        InputTextareaModule,
        DialogModule,
        DropdownModule,
        ConfirmDialogModule,
        RippleModule
    ],
    providers: [
        {provide: TaskRestService, useClass: TaskRestServiceImpl}
    ]
})
export class TaskModule {
}
