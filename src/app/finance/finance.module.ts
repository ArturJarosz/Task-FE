import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    AddCostComponent,
    CostDetailComponent,
    CostDetailShellComponent,
    CostListComponent,
    CostListShellComponent,
    CostRestService,
    CostRestServiceImpl
} from "./cost";
import {TableModule} from "primeng/table";
import {SharedModule} from "../shared/shared.module";
import {AccordionModule} from "primeng/accordion";
import {RouterModule} from "@angular/router";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {InputSwitchModule} from "primeng/inputswitch";
import {InputTextareaModule} from "primeng/inputtextarea";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {FinancialRestService, FinancialRestServiceImpl} from "./project-financial-summary/rest/financial-rest.service";
import {
    ProjectFinancialDetailShellComponent
} from "./project-financial-summary/project-financial-detail-shell/project-financial-detail-shell.component";
import {InstallmentListShellComponent} from './installment/installment-list-shell/installment-list-shell.component';
import {InstallmentListComponent} from './installment/installment-list/installment-list.component';
import {InstallmentRestService, InstallmentRestServiceImpl} from "./installment/rest/installment-rest.service";
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";
import {SupplyListComponent} from "./supply/supply-list/supply-list.component";
import {SupplyRestService, SupplyRestServiceImpl} from "./supply/rest/supply-rest.service";
import {ContractorJobListComponent} from './contractor-job/contractor-job-list/contractor-job-list.component';
import {
    ContractorJobRestService,
    ContractorJobRestServiceImpl
} from "./contractor-job/rest/contractor-job-rest.service";
import {AddSupplyComponent} from './supply/add-supply/add-supply.component';
import {SupplyListShellComponent} from './supply/supply-list-shell/supply-list-shell.component';
import {
    ContractorJobListShellComponent
} from './contractor-job/contractor-job-list-shell/contractor-job-list-shell.component';
import {AddContractorJobComponent} from './contractor-job/add-contractor-job/add-contractor-job.component';
import {AddInstallmentComponent} from './installment/add-installment/add-installment.component';
import {
    InstallmentDetailShellComponent
} from './installment/installment-detail-shell/installment-detail-shell.component';
import { InstallmentDetailComponent } from './installment/installment-detail/installment-detail.component';

@NgModule({
    declarations: [
        AddCostComponent,
        AddSupplyComponent,
        ContractorJobListComponent,
        CostDetailComponent,
        CostDetailShellComponent,
        CostListComponent,
        CostListShellComponent,
        InstallmentListComponent,
        InstallmentListShellComponent,
        SupplyListComponent,
        SupplyListShellComponent,
        ContractorJobListShellComponent,
        AddContractorJobComponent,
        AddInstallmentComponent,
        InstallmentDetailShellComponent,
        InstallmentDetailComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        TableModule,
        AccordionModule,
        RouterModule.forChild([
            {
                path: 'projects/:projectId/costs/:costId',
                component: CostDetailShellComponent,
                canActivate: [loggedInGuardGuard],
            },
            {
                path: 'projects/:projectId/installments/:installmentId',
                component: InstallmentDetailShellComponent,
                canActivate: [loggedInGuardGuard],
            },
            {
                path: 'projects/:projectId/finance',
                component: ProjectFinancialDetailShellComponent,
                canActivate: [loggedInGuardGuard]
            },
            {path: 'projects/:projectId/costs', redirectTo: '/projects/:projectId/finance?tab=costs'},
            {path: 'projects/:projectId/installments', redirectTo: 'projects/:projectId/finance?tab=installments'},
            {path: 'projects/:projectId/supplies', redirectTo: 'projects/:projectId/finance?tab=supplies'},
            {path: 'projects/:projectId/contractorJobs', redirectTo: 'projects/:projectId/finance?tab=contractorJobs'},
        ]),
        InputTextModule,
        CalendarModule,
        InputSwitchModule,
        InputTextareaModule,
        DialogModule,
        DropdownModule
    ],
    exports: [
        CostListComponent,
        CostListShellComponent,
        InstallmentListShellComponent,
        ContractorJobListComponent,
        SupplyListComponent,
        SupplyListShellComponent,
        ContractorJobListShellComponent
    ],
    providers: [
        {provide: CostRestService, useClass: CostRestServiceImpl},
        {provide: FinancialRestService, useClass: FinancialRestServiceImpl},
        {provide: InstallmentRestService, useClass: InstallmentRestServiceImpl},
        {provide: SupplyRestService, useClass: SupplyRestServiceImpl},
        {provide: ContractorJobRestService, useClass: ContractorJobRestServiceImpl}
    ]
})
export class FinanceModule {
}
