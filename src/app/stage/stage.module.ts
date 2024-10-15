import {NgModule} from "@angular/core";
import {StageRestService, StageRestServiceImpl} from "./rest/stage-rest.service";
import {StageListComponent} from "./stage-list/stage-list.component";
import {TableModule} from "primeng/table";
import {RouterLink, RouterModule} from "@angular/router";
import {StageDetailComponent} from "./stage-detail/stage-detail.component";
import {StageDetailShellComponent} from "./stage-detail-shell/stage-detail-shell.component";
import {SharedModule} from "../shared/shared.module";
import {AsyncPipe, NgClass, NgIf} from "@angular/common";
import {AccordionModule} from "primeng/accordion";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {StageListShellComponent} from './stage-list-shell/stage-list-shell.component';
import {TaskModule} from "../task/task.module";
import {AddStageComponent} from './add-stage/add-stage.component';
import {DialogModule} from "primeng/dialog";
import {InputTextareaModule} from "primeng/inputtextarea";
import {RippleModule} from "primeng/ripple";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToggleButtonModule} from "primeng/togglebutton";
import {InputSwitchModule} from "primeng/inputswitch";
import {CheckboxModule} from "primeng/checkbox";
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";

@NgModule({
    declarations: [
        StageListComponent,
        StageListShellComponent,
        StageDetailShellComponent,
        StageDetailComponent,
        AddStageComponent
    ],
    imports: [
        TableModule,
        RouterModule.forChild([
            {
                path: 'projects/:projectId/stages/:stageId',
                component: StageDetailShellComponent,
                canActivate: [loggedInGuardGuard]
            }
        ]),
        RouterLink,
        SharedModule,
        AsyncPipe,
        AccordionModule,
        DropdownModule,
        InputTextModule,
        CalendarModule,
        NgIf,
        TaskModule,
        DialogModule,
        InputTextareaModule,
        NgClass,
        RippleModule,
        ConfirmDialogModule,
        ToggleButtonModule,
        InputSwitchModule,
        CheckboxModule
    ],
    exports: [
        StageListComponent,
        StageListShellComponent
    ],
    providers: [
        {provide: StageRestService, useClass: StageRestServiceImpl}
    ]
})
export class StageModule {

}
