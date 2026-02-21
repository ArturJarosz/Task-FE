import {NgModule} from '@angular/core';
import {ClientListComponent} from './client-list/client-list.component';
import {TableModule} from 'primeng/table';
import {ClientDetailComponent} from './client-detail/client-detail.component';
import {RouterModule} from "@angular/router";
import {CardModule} from "primeng/card";
import {PanelModule} from "primeng/panel";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {SelectModule} from "primeng/select";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {KeyFilterModule} from "primeng/keyfilter";
import {RippleModule} from "primeng/ripple";
import {Textarea} from "primeng/inputtextarea";
import {DividerModule} from "primeng/divider";
import {SharedModule} from "../shared/shared.module";
import {AddClientComponent} from "./add-client";
import {ClientRestService, ClientRestServiceImpl} from "./rest/client-rest.service";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {ClientDetailShellComponent} from './client-detail-shell/client-detail-shell.component';
import {ClientListShellComponent} from './client-list-shell/client-list-shell.component';
import {AccordionModule} from "primeng/accordion";
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";
import { ClientProjectsSummaryComponent } from './client-projects-summary/client-projects-summary.component';
import { ClientProjectsSummaryShellComponent } from './client-projects-summary-shell/client-projects-summary-shell.component';

@NgModule({
    declarations: [
        ClientListComponent,
        ClientDetailComponent,
        AddClientComponent,
        ClientDetailShellComponent,
        ClientListShellComponent,
        ClientProjectsSummaryComponent,
        ClientProjectsSummaryShellComponent
    ],
    imports: [
        BrowserAnimationsModule,
        SharedModule,
        CardModule,
        PanelModule,
        TableModule,
        RouterModule.forChild([
            {path: 'clients', component: ClientListShellComponent, canActivate: [loggedInGuardGuard]},
            {path: 'clients/:id', component: ClientDetailShellComponent, canActivate: [loggedInGuardGuard]}
        ]),
        DialogModule,
        ButtonModule,
        SelectModule,
        FormsModule,
        InputTextModule,
        KeyFilterModule,
        RippleModule,
        Textarea,
        DividerModule,
        ConfirmDialogModule,
        AccordionModule
    ],
    exports: [
        ClientListComponent
    ],
    providers: [
        {provide: ClientRestService, useClass: ClientRestServiceImpl},
        {provide: ConfirmationService, useClass: ConfirmationService},
        {provide: MessageService, useClass: MessageService}
    ]
})
export class ClientModule {
}
