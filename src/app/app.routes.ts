import {Routes} from '@angular/router';
import {loggedInGuardGuard} from './security/logged-in-guard/logged-in-guard.guard';
import {MainComponent} from './main/main.component';
import {ProjectListShellComponent} from './project/project-list-shell/project-list-shell.component';
import {ProjectDetailShellComponent} from './project/project-detail-shell/project-detail-shell.component';
import {StageDetailShellComponent} from './stage/stage-detail-shell/stage-detail-shell.component';
import {TaskDetailShellComponent} from './task/task-detail-shell/task-detail-shell.component';
import {ContractorListShellComponent} from './contractor/contractor-list-shell/contractor-list-shell.component';
import {ContractorDetailShellComponent} from './contractor/contractor-detail-shell/contractor-detail-shell.component';
import {SupplierListShellComponent} from './supplier/supplier-list-shell/supplier-list-shell.component';
import {SupplierDetailShellComponent} from './supplier/supplier-detail-shell/supplier-detail-shell.component';
import {CostDetailShellComponent} from './finance/cost/cost-detail-shell/cost-detail-shell.component';
import {InstallmentDetailShellComponent} from './finance/installment/installment-detail-shell/installment-detail-shell.component';
import {ProjectFinancialDetailShellComponent} from './finance/project-financial-summary/project-financial-detail-shell/project-financial-detail-shell.component';
import {SupervisionVisitDetailShellComponent} from './finance/supervision/supervision-visit-detail-shell/supervision-visit-detail-shell.component';
import {SupplyDetailShellComponent} from './finance/supply/supply-detail-shell/supply-detail-shell.component';
import {ContractorJobDetailShellComponent} from './finance/contractor-job/contractor-job-detail-shell/contractor-job-detail-shell.component';
import {FinancialReportShellComponent} from './financial-report/financial-report-shell/financial-report-shell.component';
import {LogoutComponent} from './security/logout/logout.component';
import {NotLoggedInComponent} from './security/not-logged-in/not-logged-in.component';
import {ClientListShellComponent} from './client/client-list-shell/client-list-shell.component';
import {ClientDetailShellComponent} from './client/client-detail-shell/client-detail-shell.component';
import {ArchitectListComponent} from './architect/architect-list/architect-list.component';
import {ArchitectDetailShellComponent} from './architect/architect-detail-shell/architect-detail-shell.component';

export const appRoutes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: MainComponent, canActivate: [loggedInGuardGuard]},
    // Project routes
    {path: 'projects', component: ProjectListShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId', component: ProjectDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/stages', component: ProjectDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/stages/:stageId', component: StageDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/stages/:stageId/tasks/:taskId', component: TaskDetailShellComponent},
    // Finance routes
    {path: 'projects/:projectId/costs/:costId', component: CostDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/installments/:installmentId', component: InstallmentDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/finance', component: ProjectFinancialDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/supervision/:supervisionId/visits/:visitId', component: SupervisionVisitDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/supplies/:supplyId', component: SupplyDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/contractorJob/:contractorJobId', component: ContractorJobDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'projects/:projectId/costs', redirectTo: '/projects/:projectId/finance?tab=costs'},
    {path: 'projects/:projectId/installments', redirectTo: 'projects/:projectId/finance?tab=installments'},
    {path: 'projects/:projectId/supplies', redirectTo: 'projects/:projectId/finance?tab=supplies'},
    {path: 'projects/:projectId/contractorJobs', redirectTo: 'projects/:projectId/finance?tab=contractorJobs'},
    {path: 'projects/:projectId/supervision', redirectTo: 'projects/:projectId/finance?tab=supervision'},
    {path: 'projects/:projectId/supervision/:supervisionId/visits', redirectTo: 'projects/:projectId/finance?tab=supervision'},
    // Contractor routes
    {path: 'contractors', component: ContractorListShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'contractors/:contractorId', component: ContractorDetailShellComponent, canActivate: [loggedInGuardGuard]},
    // Supplier routes
    {path: 'suppliers', component: SupplierListShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'suppliers/:supplierId', component: SupplierDetailShellComponent, canActivate: [loggedInGuardGuard]},
    // Financial report
    {path: 'financial-report', component: FinancialReportShellComponent, canActivate: [loggedInGuardGuard]},
    // Security routes
    {path: 'logout', component: LogoutComponent},
    {path: 'not-logged-in', component: NotLoggedInComponent},
    // Client routes
    {path: 'clients', component: ClientListShellComponent, canActivate: [loggedInGuardGuard]},
    {path: 'clients/:id', component: ClientDetailShellComponent, canActivate: [loggedInGuardGuard]},
    // Architect routes
    {path: 'architects', component: ArchitectListComponent, canActivate: [loggedInGuardGuard]},
    {path: 'architects/:id', component: ArchitectDetailShellComponent, canActivate: [loggedInGuardGuard]},
    {path: '**', redirectTo: 'home', pathMatch: 'full'},
];
