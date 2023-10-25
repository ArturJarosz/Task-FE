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
import {projectReducer} from "./state/project.reducer";
import {EffectsModule} from "@ngrx/effects";
import {ProjectEffects} from "./state/project.effect";

@NgModule({
    declarations: [
        ProjectListComponent
    ],
    imports: [
        CommonModule,
        ButtonModule,
        ConfirmDialogModule,
        RippleModule,
        SharedModule,
        SharedModule,
        TableModule,
        SharedModule,
        SharedModule,
        RouterModule.forChild([
            {path: 'projects', component: ProjectListComponent}
        ]),
        StoreModule.forFeature(Features.PROJECT, projectReducer),
        EffectsModule.forFeature([ProjectEffects])
    ],
    providers: [
        {provide: ProjectRestService, useClass: ProjectRestServiceImpl}
    ]
})
export class ProjectModule {
}
