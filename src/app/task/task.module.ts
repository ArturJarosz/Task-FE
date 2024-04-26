import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskListShellComponent } from './task-list-shell/task-list-shell.component';
import {TableModule} from "primeng/table";



@NgModule({
    declarations: [
        TaskListComponent,
        TaskListShellComponent
    ],
    exports: [
        TaskListShellComponent
    ],
    imports: [
        CommonModule,
        TableModule
    ]
})
export class TaskModule { }
