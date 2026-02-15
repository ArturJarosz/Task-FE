import {NgModule} from "@angular/core";
import {WrapperComponent} from "./wrapper/wrapper.component";
import {ReactiveFormsModule} from "@angular/forms";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {SharedModule as SharedPrimeNgModule} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ConfigurationRestService, ConfigurationRestServiceImpl} from "./configuration/rest/configuration.rest";
import {UserRestService, UserRestServiceImpl} from "./user/rest/user-rest.service";
import {CurrencyPipe, NgIf} from "@angular/common";
import {authHttpInterceptorFn, provideAuth0} from "@auth0/auth0-angular";
import {auth_config} from "../auth.config";
import { FinanceComponentSummaryComponent } from './finance-component-summary/finance-component-summary.component';
import {BreadcrumbService, BreadcrumbServiceImpl} from "./breadcrumb/breadcrumb.service";
import {AccordionModule} from "primeng/accordion";

@NgModule({
    declarations: [
        WrapperComponent,
        FinanceComponentSummaryComponent
    ],
    imports: [
        ReactiveFormsModule,
        SharedPrimeNgModule,
        ToastModule,
        NgIf,
        CurrencyPipe,
        AccordionModule
    ],
    exports: [
        ReactiveFormsModule,
        WrapperComponent,
        SharedPrimeNgModule,
        ToastModule,
        FinanceComponentSummaryComponent
    ],
    providers: [
        {provide: ConfigurationRestService, useClass: ConfigurationRestServiceImpl},
        {provide: UserRestService, useClass: UserRestServiceImpl},
        {provide: BreadcrumbService, useClass: BreadcrumbServiceImpl},
        provideHttpClient(withInterceptors([authHttpInterceptorFn])),
        provideAuth0(auth_config)
    ]
})
export class SharedModule {

}
