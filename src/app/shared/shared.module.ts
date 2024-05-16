import {NgModule} from "@angular/core";
import {WrapperComponent} from "./wrapper/wrapper.component";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {SharedModule as SharedPrimeNgModule} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ConfigurationRestService, ConfigurationRestServiceImpl} from "./configuration/rest/configuration.rest";
import {NgIf} from "@angular/common";

@NgModule({
    declarations: [
        WrapperComponent
    ],
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
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
        {provide: ConfigurationRestService, useClass: ConfigurationRestServiceImpl}
    ]
})
export class SharedModule {

}
