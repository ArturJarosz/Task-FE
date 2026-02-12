import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from "../shared/shared.module";
import {TableModule} from "primeng/table";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {ChartModule} from "primeng/chart";
import {SelectButtonModule} from "primeng/selectbutton";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";
import {FinancialReportRestService, FinancialReportRestServiceImpl} from "./rest/financial-report-rest.service";
import {FinancialReportShellComponent} from "./financial-report-shell/financial-report-shell.component";
import {FinancialReportComponent} from "./financial-report/financial-report.component";

@NgModule({
    declarations: [
        FinancialReportShellComponent,
        FinancialReportComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        TableModule,
        CalendarModule,
        DropdownModule,
        ChartModule,
        SelectButtonModule,
        RouterModule.forChild([
            {
                path: 'financial-report',
                component: FinancialReportShellComponent,
                canActivate: [loggedInGuardGuard]
            }
        ])
    ],
    providers: [
        {provide: FinancialReportRestService, useClass: FinancialReportRestServiceImpl}
    ]
})
export class FinancialReportModule {
}
