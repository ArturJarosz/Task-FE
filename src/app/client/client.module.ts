import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClientListComponent} from './client-list/client-list.component';
import {TableModule} from 'primeng/table';
import {ClientService, ClientServiceImpl} from "./service/client.service";
import {HttpClientModule} from "@angular/common/http";
import {ClientDetailComponent} from './client-detail/client-detail.component';
import {RouterModule} from "@angular/router";
import {CardModule} from "primeng/card";
import {PanelModule} from "primeng/panel";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { AddClientComponent } from './add-client/add-client.component';
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {KeyFilterModule} from "primeng/keyfilter";
import {RippleModule} from "primeng/ripple";
import {InputTextareaModule} from "primeng/inputtextarea";
import {AppModule} from "../app.module";
import {WrapperComponent} from "../shared/wrapper/wrapper.component";
import {DividerModule} from "primeng/divider";

@NgModule({
    declarations: [
        ClientListComponent,
        ClientDetailComponent,
        AddClientComponent,
        WrapperComponent
    ],
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        CardModule,
        PanelModule,
        TableModule,
        HttpClientModule,
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
        ReactiveFormsModule,
        InputTextareaModule,
        DividerModule
    ],
    exports: [
        ClientListComponent
    ],
    providers: [
        {provide: ClientService, useClass: ClientServiceImpl}
    ]
})
export class ClientModule {
}
