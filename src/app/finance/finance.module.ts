import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CostListComponent} from "./cost/cost-list/cost-list.component";
import {TableModule} from "primeng/table";
import {CostDetailShellComponent} from "./cost/cost-detail-shell/cost-detail-shell.component";
import {CostDetailComponent} from './cost/cost-detail/cost-detail.component';
import {CostRestService, CostRestServiceImpl} from "./cost/rest/cost-rest.service";
import {SharedModule} from "../shared/shared.module";
import {AccordionModule} from "primeng/accordion";
import {RouterModule} from "@angular/router";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {InputSwitchModule} from "primeng/inputswitch";
import {InputTextareaModule} from "primeng/inputtextarea";
import {CostListShellComponent} from './cost/cost-list-shell/cost-list-shell.component';
import {AddCostComponent} from './cost/add-cost/add-cost.component';
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

@NgModule({
    declarations: [
        CostDetailShellComponent,
        CostListComponent,
        CostDetailComponent,
        CostListShellComponent,
        AddCostComponent,
        InstallmentListShellComponent,
        InstallmentListComponent,
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
                canActivate: [loggedInGuardGuard]
            },
            {
                path: 'projects/:projectId/finance',
                component: ProjectFinancialDetailShellComponent,
                canActivate: [loggedInGuardGuard]
            },
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
        InstallmentListShellComponent
    ],
    providers: [
        {provide: CostRestService, useClass: CostRestServiceImpl},
        {provide: FinancialRestService, useClass: FinancialRestServiceImpl},
        {provide: InstallmentRestService, useClass: InstallmentRestServiceImpl}
    ]

})
export class FinanceModule {
}
