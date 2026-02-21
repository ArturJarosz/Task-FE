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
import {ButtonModule} from "primeng/button";
import {RouterModule} from "@angular/router";
import {InputTextModule} from "primeng/inputtext";
import {DatePickerModule} from "primeng/datepicker";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {Textarea} from "primeng/inputtextarea";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
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
import {InstallmentDetailComponent} from './installment/installment-detail/installment-detail.component';
import {InputNumberModule} from "primeng/inputnumber";
import {SupervisionShellComponent} from './supervision/supervision-shell/supervision-shell.component';
import {SupervisionComponent} from './supervision/supervision/supervision.component';
import {SupervisionRestService, SupervisionRestServiceImpl} from "./supervision/rest/supervision-rest.service";
import {AddSupervisionComponent} from './supervision/add-supervision/add-supervision.component';
import {AddSupervisionVisitComponent} from './supervision/add-supervision-visit/add-supervision-visit.component';
import {
    SupervisionVisitDetailShellComponent
} from './supervision/supervision-visit-detail-shell/supervision-visit-detail-shell.component';
import {
    SupervisionVisitDetailComponent
} from './supervision/supervision-visit-detail/supervision-visit-detail.component';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {
    SupplyDetailShellComponent
} from './supply/supply-detail-shell/supply-detail-shell.component';
import {SupplyDetailComponent} from './supply/supply-detail/supply-detail.component';
import {
    ContractorJobDetailShellComponent
} from './contractor-job/contractor-job-detail-shell/contractor-job-detail-shell.component';
import {
    ContractorJobDetailComponent
} from './contractor-job/contractor-job-detail/contractor-job-detail.component';

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
        InstallmentDetailComponent,
        SupervisionShellComponent,
        SupervisionComponent,
        AddSupervisionComponent,
        AddSupervisionVisitComponent,
        SupervisionVisitDetailShellComponent,
        SupervisionVisitDetailComponent,
        SupplyDetailShellComponent,
        SupplyDetailComponent,
        ContractorJobDetailShellComponent,
        ContractorJobDetailComponent
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
            {
                path: 'projects/:projectId/supervision/:supervisionId/visits/:visitId',
                component: SupervisionVisitDetailShellComponent,
                canActivate: [loggedInGuardGuard],
            },
            {
                path: 'projects/:projectId/supplies/:supplyId',
                component: SupplyDetailShellComponent,
                canActivate: [loggedInGuardGuard],
            },
            {
                path: 'projects/:projectId/contractorJob/:contractorJobId',
                component: ContractorJobDetailShellComponent,
                canActivate: [loggedInGuardGuard],
            },
            {
                path: 'projects/:projectId/costs',
                redirectTo: '/projects/:projectId/finance?tab=costs'
            },
            {
                path: 'projects/:projectId/installments',
                redirectTo: 'projects/:projectId/finance?tab=installments'
            },
            {
                path: 'projects/:projectId/supplies',
                redirectTo: 'projects/:projectId/finance?tab=supplies'
            },
            {
                path: 'projects/:projectId/contractorJobs',
                redirectTo: 'projects/:projectId/finance?tab=contractorJobs'
            },
            {
                path: 'projects/:projectId/supervision',
                redirectTo: 'projects/:projectId/finance?tab=supervision'
            },
            {
                path: 'projects/:projectId/supervision/:supervisionId/visits',
                redirectTo: 'projects/:projectId/finance?tab=supervision'
            }
        ]),
        InputTextModule,
        DatePickerModule,
        ToggleSwitchModule,
        Textarea,
        DialogModule,
        SelectModule,
        InputNumberModule,
        ConfirmDialogModule,
        ButtonModule
    ],
    exports: [
        CostListComponent,
        CostListShellComponent,
        InstallmentListShellComponent,
        ContractorJobListComponent,
        SupplyListComponent,
        SupplyListShellComponent,
        ContractorJobListShellComponent,
        SupervisionShellComponent,
        AddSupervisionComponent
    ],
    providers: [
        {provide: CostRestService, useClass: CostRestServiceImpl},
        {provide: FinancialRestService, useClass: FinancialRestServiceImpl},
        {provide: InstallmentRestService, useClass: InstallmentRestServiceImpl},
        {provide: SupplyRestService, useClass: SupplyRestServiceImpl},
        {provide: ContractorJobRestService, useClass: ContractorJobRestServiceImpl},
        {provide: SupervisionRestService, useClass: SupervisionRestServiceImpl}
    ]
})
export class FinanceModule {
}
