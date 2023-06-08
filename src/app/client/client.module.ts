import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClientsListComponent} from './clients-list/clients-list.component';
import {TableModule} from 'primeng/table';
import {ClientService, ClientServiceImpl} from "./service/client.service";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
    declarations: [
        ClientsListComponent
    ],
    imports: [
        CommonModule,
        TableModule,
        HttpClientModule
    ],
    exports: [
        ClientsListComponent
    ],
    providers: [
        {provide: ClientService, useClass: ClientServiceImpl}
    ]
})
export class ClientModule {
}
