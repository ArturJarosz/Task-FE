import {NgModule} from "@angular/core";
import {WrapperComponent} from "./wrapper/wrapper.component";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {SharedModule as SharedPrimeNgModule} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ConfigurationRestService, ConfigurationRestServiceImpl} from "./configuration/rest/configuration.rest";
import {StoreModule} from "@ngrx/store";
import {Features} from "../features";
import {configurationReducer, ConfigurationEffects} from "./configuration/state";
import {EffectsModule} from "@ngrx/effects";

@NgModule({
    declarations: [
        WrapperComponent
    ],
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        SharedPrimeNgModule,
        ToastModule,
        StoreModule.forFeature(Features.CONFIGURATION, configurationReducer),
        EffectsModule.forFeature([ConfigurationEffects])
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
