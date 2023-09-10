import {NgModule} from "@angular/core";
import {WrapperComponent} from "./wrapper/wrapper.component";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {SharedModule as SharedPrimeNgModule} from "primeng/api";

@NgModule({
    declarations: [
        WrapperComponent
    ],
    imports: [
        ReactiveFormsModule,
        HttpClientModule,
        SharedPrimeNgModule
    ],
    exports: [
        ReactiveFormsModule,
        WrapperComponent,
        SharedPrimeNgModule
    ]
})
export class SharedModule {

}
