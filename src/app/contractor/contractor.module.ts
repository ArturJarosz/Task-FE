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
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {ContractorListShellComponent} from './contractor-list-shell/contractor-list-shell.component';
import {ContractorDetailShellComponent} from './contractor-detail-shell/contractor-detail-shell.component';
import {ContractorDetailComponent} from './contractor-detail/contractor-detail.component';
import {AccordionModule} from "primeng/accordion";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {RippleModule} from "primeng/ripple";
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";
import {ContractorJobListShellComponent} from './contractor-job-list-shell/contractor-job-list-shell.component';
import {ContractorJobListComponent} from './contractor-job-list/contractor-job-list.component';

@NgModule({
    declarations: [
        ContractorListComponent,
        AddContractorComponent,
        ContractorListShellComponent,
        ContractorDetailShellComponent,
        ContractorDetailComponent,
        ContractorJobListShellComponent,
        ContractorJobListComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: 'contractors',
                component: ContractorListShellComponent,
                canActivate: [loggedInGuardGuard]
            },
            {
                path: 'contractors/:contractorId',
                component: ContractorDetailShellComponent,
                canActivate: [loggedInGuardGuard]
            }
        ]),
        SharedModule,
        TableModule,
        ButtonModule,
        DialogModule,
        SelectModule,
        InputTextModule,
        Textarea,
        AccordionModule,
        ConfirmDialogModule,
        RippleModule
    ],
    providers: [
        {provide: ContractorRestService, useClass: ContractorRestServiceImpl}
    ]
})
export class ContractorModule {
}
