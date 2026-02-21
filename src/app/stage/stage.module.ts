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
import {ButtonModule} from "primeng/button";
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {DatePickerModule} from "primeng/datepicker";
import {StageListShellComponent} from './stage-list-shell/stage-list-shell.component';
import {TaskModule} from "../task/task.module";
import {AddStageComponent} from './add-stage/add-stage.component';
import {DialogModule} from "primeng/dialog";
import {Textarea} from "primeng/inputtextarea";
import {RippleModule} from "primeng/ripple";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToggleButtonModule} from "primeng/togglebutton";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {CheckboxModule} from "primeng/checkbox";
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";
import {InputNumberModule} from "primeng/inputnumber";
import {AvatarModule} from "primeng/avatar";
import {TooltipModule} from "primeng/tooltip";

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
        SelectModule,
        InputTextModule,
        DatePickerModule,
        NgIf,
        TaskModule,
        DialogModule,
        Textarea,
        NgClass,
        RippleModule,
        ConfirmDialogModule,
        ToggleButtonModule,
        ToggleSwitchModule,
        CheckboxModule,
        InputNumberModule,
        AvatarModule,
        TooltipModule,
        ButtonModule
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
