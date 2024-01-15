import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {ArchitectListComponent} from "./architect-list/architect-list.component";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {TableModule} from "primeng/table";
import {ArchitectRestService, ArchitectRestServiceImpl} from "./rest/architect-rest.service";
import {SharedModule} from "../shared/shared.module";
import { ArchitectDetailComponent } from './architect-detail/architect-detail.component';
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {NgIf, NgSwitchCase} from "@angular/common";
import {StoreModule} from "@ngrx/store";
import {Features} from "../features";
import {EffectsModule} from "@ngrx/effects";
import {architectReducer, ArchitectEffects} from "./state";

@NgModule({
    declarations: [
        ArchitectListComponent,
        ArchitectDetailComponent
    ],
    imports: [
        RouterModule.forChild([
            {path: 'architects', component: ArchitectListComponent},
            {path: 'architects/:id', component: ArchitectDetailComponent}
        ]),
        ButtonModule,
        RippleModule,
        SharedModule,
        TableModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        NgIf,
        NgSwitchCase,
        StoreModule.forFeature(Features.ARCHITECT, architectReducer),
        EffectsModule.forFeature([ArchitectEffects])
    ],
    providers: [
        {provide: ArchitectRestService, useClass: ArchitectRestServiceImpl}
    ]
})
export class ArchitectModule {

}
