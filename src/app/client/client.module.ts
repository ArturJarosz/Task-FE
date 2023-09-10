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
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {KeyFilterModule} from "primeng/keyfilter";
import {RippleModule} from "primeng/ripple";
import {InputTextareaModule} from "primeng/inputtextarea";
import {DividerModule} from "primeng/divider";
import {SharedModule} from "../shared/shared.module";
import {AddClientComponent} from "./add-client";
import {ClientRestService, ClientRestServiceImpl} from "./service/client-rest.service";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmationService} from "primeng/api";

@NgModule({
    declarations: [
        ClientListComponent,
        ClientDetailComponent,
        AddClientComponent
    ],
    imports: [
        BrowserAnimationsModule,
        SharedModule,
        CardModule,
        PanelModule,
        TableModule,
        RouterModule.forChild([
            {path: 'clients', component: ClientListComponent},
            {path: 'clients/:id', component: ClientDetailComponent}
        ]),
        DialogModule,
        ButtonModule,
        DropdownModule,
        FormsModule,
        InputTextModule,
        KeyFilterModule,
        RippleModule,
        InputTextareaModule,
        DividerModule,
        SharedModule,
        ConfirmDialogModule
    ],
    exports: [
        ClientListComponent
    ],
    providers: [
        {provide: ClientRestService, useClass: ClientRestServiceImpl},
        {provide: ConfirmationService, useClass: ConfirmationService}
    ]
})
export class ClientModule {
}
