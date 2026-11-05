import {Routes} from '@angular/router';
import {loggedInGuardGuard} from './security/logged-in-guard/logged-in-guard.guard';

// Every page loads on demand (its own chunk), so the first load only fetches the app shell and the page it opens
export const appRoutes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', loadComponent: () => import('./dashboard/dashboard-shell/dashboard-shell.component').then(m => m.DashboardShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Project routes
    {path: 'projects', loadComponent: () => import('./project/project-list-shell/project-list-shell.component').then(m => m.ProjectListShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'projects/:projectId', loadComponent: () => import('./project/project-detail-shell/project-detail-shell.component').then(m => m.ProjectDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true, view: 'overview'}},
    {path: 'projects/:projectId/stages', loadComponent: () => import('./project/project-detail-shell/project-detail-shell.component').then(m => m.ProjectDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true, view: 'stages'}},
    {path: 'projects/:projectId/stages/:stageId', loadComponent: () => import('./stage/stage-detail-shell/stage-detail-shell.component').then(m => m.StageDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'projects/:projectId/stages/:stageId/tasks/:taskId', loadComponent: () => import('./task/task-detail-shell/task-detail-shell.component').then(m => m.TaskDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Finance routes
    {path: 'projects/:projectId/costs/:costId', loadComponent: () => import('./finance/cost/cost-detail-shell/cost-detail-shell.component').then(m => m.CostDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'projects/:projectId/installments/:installmentId', loadComponent: () => import('./finance/installment/installment-detail-shell/installment-detail-shell.component').then(m => m.InstallmentDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'projects/:projectId/timeline', loadComponent: () => import('./project/project-detail-shell/project-detail-shell.component').then(m => m.ProjectDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true, view: 'timeline'}},
    {path: 'projects/:projectId/finance', loadComponent: () => import('./project/project-detail-shell/project-detail-shell.component').then(m => m.ProjectDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true, view: 'finance'}},
    {path: 'projects/:projectId/supervision/:supervisionId/visits/:visitId', loadComponent: () => import('./finance/supervision/supervision-visit-detail-shell/supervision-visit-detail-shell.component').then(m => m.SupervisionVisitDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'projects/:projectId/supplies/:supplyId', loadComponent: () => import('./finance/supply/supply-detail-shell/supply-detail-shell.component').then(m => m.SupplyDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'projects/:projectId/contractorJob/:contractorJobId', loadComponent: () => import('./finance/contractor-job/contractor-job-detail-shell/contractor-job-detail-shell.component').then(m => m.ContractorJobDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'projects/:projectId/costs', redirectTo: '/projects/:projectId/finance?tab=costs'},
    {path: 'projects/:projectId/installments', redirectTo: 'projects/:projectId/finance?tab=installments'},
    {path: 'projects/:projectId/supplies', redirectTo: 'projects/:projectId/finance?tab=supplies'},
    {path: 'projects/:projectId/contractorJobs', redirectTo: 'projects/:projectId/finance?tab=contractorJobs'},
    {path: 'projects/:projectId/supervision', redirectTo: 'projects/:projectId/finance?tab=supervision'},
    {path: 'projects/:projectId/supervision/:supervisionId/visits', redirectTo: 'projects/:projectId/finance?tab=supervision'},
    // Contractor routes
    {path: 'contractors', loadComponent: () => import('./contractor/contractor-list-shell/contractor-list-shell.component').then(m => m.ContractorListShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'contractors/:contractorId', loadComponent: () => import('./contractor/contractor-detail-shell/contractor-detail-shell.component').then(m => m.ContractorDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Supplier routes
    {path: 'suppliers', loadComponent: () => import('./supplier/supplier-list-shell/supplier-list-shell.component').then(m => m.SupplierListShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'suppliers/:supplierId', loadComponent: () => import('./supplier/supplier-detail-shell/supplier-detail-shell.component').then(m => m.SupplierDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Financial report
    {path: 'financial-report', loadComponent: () => import('./financial-report/financial-report-shell/financial-report-shell.component').then(m => m.FinancialReportShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Calendar routes
    {path: 'calendar', loadComponent: () => import('./calendar/calendar-shell/calendar-shell.component').then(m => m.CalendarShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Settings routes
    {path: 'settings', redirectTo: 'settings/system-parameters', pathMatch: 'full'},
    {path: 'settings/:section', loadComponent: () => import('./settings/settings-shell/settings-shell.component').then(m => m.SettingsShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Security routes
    {path: 'logout', loadComponent: () => import('./security/logout/logout.component').then(m => m.LogoutComponent), data: {ownPageHeader: true}},
    {path: 'not-logged-in', loadComponent: () => import('./security/not-logged-in/not-logged-in.component').then(m => m.NotLoggedInComponent), data: {ownPageHeader: true}},
    // Client routes
    {path: 'clients', loadComponent: () => import('./client/client-list-shell/client-list-shell.component').then(m => m.ClientListShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'clients/:id', loadComponent: () => import('./client/client-detail-shell/client-detail-shell.component').then(m => m.ClientDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    // Architect routes
    {path: 'architects', loadComponent: () => import('./architect/architect-list-shell/architect-list-shell.component').then(m => m.ArchitectListShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: 'architects/:id', loadComponent: () => import('./architect/architect-detail-shell/architect-detail-shell.component').then(m => m.ArchitectDetailShellComponent), canActivate: [loggedInGuardGuard], data: {ownPageHeader: true}},
    {path: '**', redirectTo: 'home', pathMatch: 'full'},
];
