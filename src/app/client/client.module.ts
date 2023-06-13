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

@NgModule({
    declarations: [
        ClientListComponent,
        ClientDetailComponent
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
        ])
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
