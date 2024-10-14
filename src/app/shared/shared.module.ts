import {NgModule} from "@angular/core";
import {WrapperComponent} from "./wrapper/wrapper.component";
import {ReactiveFormsModule} from "@angular/forms";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {SharedModule as SharedPrimeNgModule} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ConfigurationRestService, ConfigurationRestServiceImpl} from "./configuration/rest/configuration.rest";
import {NgIf} from "@angular/common";
import {authHttpInterceptorFn, provideAuth0} from "@auth0/auth0-angular";
import {auth_config} from "../auth.config";

@NgModule({
    declarations: [
        WrapperComponent
    ],
    imports: [
        ReactiveFormsModule,
        SharedPrimeNgModule,
        ToastModule,
        NgIf
    ],
    exports: [
        ReactiveFormsModule,
        WrapperComponent,
        SharedPrimeNgModule,
        ToastModule,
    ],
    providers: [
        {provide: ConfigurationRestService, useClass: ConfigurationRestServiceImpl},
        provideHttpClient(withInterceptors([authHttpInterceptorFn])),
        provideAuth0(auth_config)
    ]
})
export class SharedModule {

}
