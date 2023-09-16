import {NgModule} from "@angular/core";
import {WrapperComponent} from "./wrapper/wrapper.component";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {SharedModule as SharedPrimeNgModule} from "primeng/api";
import {ToastModule} from "primeng/toast";

@NgModule({
    declarations: [
        WrapperComponent
    ],
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        SharedPrimeNgModule,
        ToastModule
    ],
    exports: [
        ReactiveFormsModule,
        WrapperComponent,
        SharedPrimeNgModule,
        ToastModule,
    ]
})
export class SharedModule {

}
