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
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {CurrencyPipe, NgIf, NgSwitchCase} from "@angular/common";
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";
import {ArchitectProjectsSummaryComponent} from "./architect-projects-summary/architect-projects-summary.component";
import { ArchitectDetailShellComponent } from './architect-detail-shell/architect-detail-shell.component';
import {AccordionModule} from "primeng/accordion";

@NgModule({
    declarations: [
        ArchitectListComponent,
        ArchitectDetailComponent,
        ArchitectProjectsSummaryComponent,
        ArchitectDetailShellComponent
    ],
    imports: [
        RouterModule.forChild([
            {path: 'architects', component: ArchitectListComponent, canActivate: [loggedInGuardGuard]},
            {path: 'architects/:id', component: ArchitectDetailShellComponent, canActivate: [loggedInGuardGuard]}
        ]),
        ButtonModule,
        RippleModule,
        SharedModule,
        TableModule,
        DialogModule,
        SelectModule,
        InputTextModule,
        Textarea,
        NgIf,
        NgSwitchCase,
        AccordionModule,
        CurrencyPipe
    ],
    providers: [
        {provide: ArchitectRestService, useClass: ArchitectRestServiceImpl}
    ]
})
export class ArchitectModule {

}
