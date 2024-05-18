import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContractorListComponent} from "./contractor-list/contractor-list.component";
import {RouterModule} from "@angular/router";
import {ContractorRestService, ContractorRestServiceImpl} from "./rest/contractor-rest.service";
import {SharedModule} from "../shared/shared.module";
import {TableModule} from "primeng/table";
import {AddContractorComponent} from './add-contractor/add-contractor.component';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ContractorListShellComponent} from './contractor-list-shell/contractor-list-shell.component';
import {ContractorDetailShellComponent} from './contractor-detail-shell/contractor-detail-shell.component';
import {ContractorDetailComponent} from './contractor-detail/contractor-detail.component';
import {AccordionModule} from "primeng/accordion";

@NgModule({
    declarations: [
        ContractorListComponent,
        AddContractorComponent,
        ContractorListShellComponent,
        ContractorDetailShellComponent,
        ContractorDetailComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'contractors', component: ContractorListShellComponent},
            {path: 'contractors/:contractorId', component: ContractorDetailShellComponent}
        ]),
        SharedModule,
        TableModule,
        ButtonModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        AccordionModule
    ],
    providers: [
        {provide: ContractorRestService, useClass: ContractorRestServiceImpl}
    ]
})
export class ContractorModule {
}
