import {isDevMode, ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideStore} from '@ngrx/store';
import {provideEffects} from '@ngrx/effects';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {providePrimeNG} from 'primeng/config';
import {ConfirmationService, MessageService} from 'primeng/api';
import Lara from '@primeng/themes/lara';
import {definePreset} from '@primeng/themes';

const LaraVerona = definePreset(Lara, {
    components: {
        card: {
            root: {
                borderRadius: '{border.radius.xl}'
            }
        }
    }
});
import {authHttpInterceptorFn, provideAuth0} from '@auth0/auth0-angular';

import {appRoutes} from './app.routes';
import {auth_config} from './auth.config';

import {AuthorizationService, AuthorizationServiceImpl} from './security/authorization.service';
import {ProjectRestService, ProjectRestServiceImpl} from './project/rest/project-rest.service';
import {ContractRestService, ContractRestServiceImpl} from './project/rest/contract-rest.service';
import {StageRestService, StageRestServiceImpl} from './stage/rest/stage-rest.service';
import {TaskRestService, TaskRestServiceImpl} from './task/rest/task-rest.service';
import {ContractorRestService, ContractorRestServiceImpl} from './contractor/rest/contractor-rest.service';
import {SupplierRestService, SupplierRestServiceImpl} from './supplier/rest/suppplier-rest.service';
import {CostRestService, CostRestServiceImpl} from './finance/cost';
import {FinancialRestService, FinancialRestServiceImpl} from './finance/project-financial-summary/rest/financial-rest.service';
import {InstallmentRestService, InstallmentRestServiceImpl} from './finance/installment/rest/installment-rest.service';
import {SupplyRestService, SupplyRestServiceImpl} from './finance/supply/rest/supply-rest.service';
import {ContractorJobRestService, ContractorJobRestServiceImpl} from './finance/contractor-job/rest/contractor-job-rest.service';
import {SupervisionRestService, SupervisionRestServiceImpl} from './finance/supervision/rest/supervision-rest.service';
import {FinancialReportRestService, FinancialReportRestServiceImpl} from './financial-report/rest/financial-report-rest.service';
import {ConfigurationRestService, ConfigurationRestServiceImpl} from './shared/configuration/rest/configuration.rest';
import {UserRestService, UserRestServiceImpl} from './shared/user/rest/user-rest.service';
import {BreadcrumbService, BreadcrumbServiceImpl} from './shared/breadcrumb/breadcrumb.service';
import {ClientRestService, ClientRestServiceImpl} from './client/rest/client-rest.service';
import {ArchitectRestService, ArchitectRestServiceImpl} from './architect/rest/architect-rest.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes),
        provideAnimations(),
        provideStore({}),
        provideEffects([]),
        provideStoreDevtools({name: 'TASK app', maxAge: 25, logOnly: !isDevMode()}),
        provideHttpClient(withInterceptors([authHttpInterceptorFn])),
        provideAuth0(auth_config),
        providePrimeNG({
            theme: {
                preset: LaraVerona,
                options: {
                    darkModeSelector: false
                }
            }
        }),
        ConfirmationService,
        MessageService,
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
    ]
};
