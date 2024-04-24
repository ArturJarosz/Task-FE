import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SupplierListComponent} from "./supplier-list/supplier-list.component";
import {RouterModule} from "@angular/router";
import {StoreModule} from "@ngrx/store";
import {Features} from "../features";
import {SupplierEffects, supplierReducer} from "./state";
import {EffectsModule} from "@ngrx/effects";
import {SupplierRestService, SupplierRestServiceImpl} from "./rest/suppplier-rest.service";
import {SharedModule} from "../shared/shared.module";
import {TableModule} from "primeng/table";
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {InputTextareaModule} from "primeng/inputtextarea";

@NgModule({
    declarations: [
        SupplierListComponent,
        AddSupplierComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'suppliers', component: SupplierListComponent}
        ]),
        StoreModule.forFeature(Features.SUPPLIER, supplierReducer),
        EffectsModule.forFeature([SupplierEffects]),
        SharedModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        InputTextareaModule
    ],
    providers: [
        {provide: SupplierRestService, useClass: SupplierRestServiceImpl}
    ]
})
export class SupplierModule {
}
