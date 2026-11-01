import {EnvironmentProviders, LOCALE_ID, Provider} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localePl from '@angular/common/locales/pl';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AuthService} from '@auth0/auth0-angular';
import {EMPTY, of} from 'rxjs';

import {AuthorizationService, AuthorizationServiceImpl} from '../app/security/authorization.service';
import {ProjectRestService, ProjectRestServiceImpl} from '../app/project/rest/project-rest.service';
import {ContractRestService, ContractRestServiceImpl} from '../app/project/rest/contract-rest.service';
import {StageRestService, StageRestServiceImpl} from '../app/stage/rest/stage-rest.service';
import {TaskRestService, TaskRestServiceImpl} from '../app/task/rest/task-rest.service';
import {ContractorRestService, ContractorRestServiceImpl} from '../app/contractor/rest/contractor-rest.service';
import {SupplierRestService, SupplierRestServiceImpl} from '../app/supplier/rest/suppplier-rest.service';
import {CostRestService, CostRestServiceImpl} from '../app/finance/cost';
import {FinancialRestService, FinancialRestServiceImpl} from '../app/finance/project-financial-summary/rest/financial-rest.service';
import {InstallmentRestService, InstallmentRestServiceImpl} from '../app/finance/installment/rest/installment-rest.service';
import {SupplyRestService, SupplyRestServiceImpl} from '../app/finance/supply/rest/supply-rest.service';
import {ContractorJobRestService, ContractorJobRestServiceImpl} from '../app/finance/contractor-job/rest/contractor-job-rest.service';
import {SupervisionRestService, SupervisionRestServiceImpl} from '../app/finance/supervision/rest/supervision-rest.service';
import {FinancialReportRestService, FinancialReportRestServiceImpl} from '../app/financial-report/rest/financial-report-rest.service';
import {ConfigurationRestService, ConfigurationRestServiceImpl} from '../app/shared/configuration/rest/configuration.rest';
import {UserRestService, UserRestServiceImpl} from '../app/shared/user/rest/user-rest.service';
import {BreadcrumbService, BreadcrumbServiceImpl} from '../app/shared/breadcrumb/breadcrumb.service';
import {ClientRestService, ClientRestServiceImpl} from '../app/client/rest/client-rest.service';
import {ArchitectRestService, ArchitectRestServiceImpl} from '../app/architect/rest/architect-rest.service';
import {CalendarRestService, CalendarRestServiceImpl} from '../app/calendar/rest/calendar-rest.service';
import {SystemParameterRestService, SystemParameterRestServiceImpl} from '../app/settings/rest/system-parameter-rest.service';
import {GoogleCalendarConnectionRestService, GoogleCalendarConnectionRestServiceImpl} from '../app/settings/rest/google-calendar-connection-rest.service';
import {GoogleCalendarShareRestService, GoogleCalendarShareRestServiceImpl} from '../app/settings/rest/google-calendar-share-rest.service';
import {ProjectTypeRestService, ProjectTypeRestServiceImpl} from '../app/settings/rest/project-type-rest.service';
import {ContractorCategoryRestService, ContractorCategoryRestServiceImpl} from '../app/settings/rest/contractor-category-rest.service';
import {SupplierCategoryRestService, SupplierCategoryRestServiceImpl} from '../app/settings/rest/supplier-category-rest.service';
import {CostCategoryRestService, CostCategoryRestServiceImpl} from '../app/settings/rest/cost-category-rest.service';

registerLocaleData(localePl);

// Auth0 is not started in specs; this stub answers what AuthorizationServiceImpl reads
const authServiceStub: Partial<AuthService> = {
    error$: EMPTY,
    isAuthenticated$: of(false),
    user$: of(null),
    loginWithRedirect: () => EMPTY,
    logout: () => EMPTY
};

// The providers from app.config.ts, with HTTP answered by HttpTestingController and no Auth0
export function provideTestDependencies(): (Provider | EnvironmentProviders)[] {
    return [
        provideRouter([]),
        {provide: LOCALE_ID, useValue: 'pl'},
        provideHttpClient(),
        provideHttpClientTesting(),
        ConfirmationService,
        MessageService,
        {provide: AuthService, useValue: authServiceStub},
        {provide: AuthorizationService, useClass: AuthorizationServiceImpl},
        {provide: ProjectRestService, useClass: ProjectRestServiceImpl},
        {provide: ContractRestService, useClass: ContractRestServiceImpl},
        {provide: StageRestService, useClass: StageRestServiceImpl},
        {provide: TaskRestService, useClass: TaskRestServiceImpl},
        {provide: ContractorRestService, useClass: ContractorRestServiceImpl},
        {provide: SupplierRestService, useClass: SupplierRestServiceImpl},
        {provide: CostRestService, useClass: CostRestServiceImpl},
        {provide: FinancialRestService, useClass: FinancialRestServiceImpl},
        {provide: InstallmentRestService, useClass: InstallmentRestServiceImpl},
        {provide: SupplyRestService, useClass: SupplyRestServiceImpl},
        {provide: ContractorJobRestService, useClass: ContractorJobRestServiceImpl},
        {provide: SupervisionRestService, useClass: SupervisionRestServiceImpl},
        {provide: FinancialReportRestService, useClass: FinancialReportRestServiceImpl},
        {provide: ConfigurationRestService, useClass: ConfigurationRestServiceImpl},
        {provide: UserRestService, useClass: UserRestServiceImpl},
        {provide: BreadcrumbService, useClass: BreadcrumbServiceImpl},
        {provide: ClientRestService, useClass: ClientRestServiceImpl},
        {provide: ArchitectRestService, useClass: ArchitectRestServiceImpl},
        {provide: CalendarRestService, useClass: CalendarRestServiceImpl},
        {provide: SystemParameterRestService, useClass: SystemParameterRestServiceImpl},
        {provide: GoogleCalendarConnectionRestService, useClass: GoogleCalendarConnectionRestServiceImpl},
        {provide: GoogleCalendarShareRestService, useClass: GoogleCalendarShareRestServiceImpl},
        {provide: ProjectTypeRestService, useClass: ProjectTypeRestServiceImpl},
        {provide: ContractorCategoryRestService, useClass: ContractorCategoryRestServiceImpl},
        {provide: SupplierCategoryRestService, useClass: SupplierCategoryRestServiceImpl},
        {provide: CostCategoryRestService, useClass: CostCategoryRestServiceImpl},
    ];
}
