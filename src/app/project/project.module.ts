import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectListComponent} from './project-list/project-list.component';
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {RippleModule} from "primeng/ripple";
import {SharedModule} from "../shared/shared.module";
import {TableModule} from "primeng/table";
import {RouterModule} from "@angular/router";
import {ProjectRestService, ProjectRestServiceImpl} from "./rest/project-rest.service";
import {StoreModule} from "@ngrx/store";
import {Features} from "../features";
import {ProjectEffects, projectReducer} from "./state";
import {EffectsModule} from "@ngrx/effects";
import {AddProjectComponent} from "./add-project/add-project.component";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {ProjectListShellComponent} from "./project-list-shell/project-list-shell.component";
import {ProjectDetailComponent} from "./project-detail/project-detail.component";
import {ProjectDetailShellComponent} from "./project-detail-shell/project-detail-shell.component";
import {CalendarModule} from "primeng/calendar";
import {ContractRestService, ContractRestServiceImpl} from "./rest/contract-rest.service";
import {ContractStatusService, ContractStatusServiceImpl} from "./contract-status/contract-status.service";
import {TabViewModule} from "primeng/tabview";
import {DragDropModule} from "primeng/dragdrop";
import {AccordionModule} from "primeng/accordion";
import {InputTextareaModule} from "primeng/inputtextarea";
import {StageModule} from "../stage/stage.module";
import {FinanceModule} from "../finance/finance.module";
import {TaskModule} from "../task/task.module";

@NgModule({
    declarations: [
        ProjectListComponent,
        AddProjectComponent,
        ProjectListShellComponent,
        ProjectDetailShellComponent,
        ProjectDetailComponent
    ],
    imports: [
        SharedModule,
        CommonModule,
        ButtonModule,
        ConfirmDialogModule,
        RippleModule,
        TableModule,
        RouterModule.forChild([
            {path: 'projects', component: ProjectListShellComponent},
            {path: 'projects/:id', component: ProjectDetailShellComponent}
        ]),
        StoreModule.forFeature(Features.PROJECT, projectReducer),
        EffectsModule.forFeature([ProjectEffects]),
        DialogModule,
        DropdownModule,
        InputTextModule,
        CalendarModule,
        TabViewModule,
        DragDropModule,
        AccordionModule,
        InputTextareaModule,
        StageModule,
        FinanceModule
    ],
    providers: [
        {provide: ProjectRestService, useClass: ProjectRestServiceImpl},
        {provide: ContractRestService, useClass: ContractRestServiceImpl},
        {provide: ContractStatusService, useClass: ContractStatusServiceImpl}
    ]
})
export class ProjectModule {
}
