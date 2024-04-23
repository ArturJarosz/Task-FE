import {NgModule} from "@angular/core";
import {StageRestService, StageRestServiceImpl} from "./rest/stage-rest.service";
import {StageListComponent} from "./stage-list/stage-list.component";
import {TableModule} from "primeng/table";
import {RouterLink, RouterModule} from "@angular/router";
import {StageDetailComponent} from "./stage-detail/stage-detail.component";
import {StageDetailShellComponent} from "./stage-detail-shell/stage-detail-shell.component";
import {SharedModule} from "../shared/shared.module";
import {AsyncPipe, NgIf} from "@angular/common";
import {StoreModule} from "@ngrx/store";
import {Features} from "../features";
import {StageEffects, stageReducer} from "./state";
import {EffectsModule} from "@ngrx/effects";
import {AccordionModule} from "primeng/accordion";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {StageListShellComponent} from './stage-list-shell/stage-list-shell.component';

@NgModule({
    declarations: [
        StageListComponent,
        StageListShellComponent,
        StageDetailShellComponent,
        StageDetailComponent
    ],
    imports: [
        TableModule,
        RouterModule.forChild([
            {path: 'projects/:projectId/stages/:stageId', component: StageDetailShellComponent}
        ]),
        RouterLink,
        SharedModule,
        StoreModule.forFeature(Features.STAGE, stageReducer),
        EffectsModule.forFeature([StageEffects]),
        AsyncPipe,
        AccordionModule,
        DropdownModule,
        InputTextModule,
        CalendarModule,
        NgIf
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
