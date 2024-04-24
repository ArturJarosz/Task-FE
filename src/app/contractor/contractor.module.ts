import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContractorListComponent} from "./contractor-list/contractor-list.component";
import {RouterModule} from "@angular/router";
import {ContractorRestService, ContractorRestServiceImpl} from "./rest/contractor-rest.service";
import {SharedModule} from "../shared/shared.module";
import {StoreModule} from "@ngrx/store";
import {Features} from "../features";
import {contractorReducer, ContractorEffects} from "./state";
import {EffectsModule} from "@ngrx/effects";
import {TableModule} from "primeng/table";
import { AddContractorComponent } from './add-contractor/add-contractor.component';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";

@NgModule({
    declarations: [
        ContractorListComponent,
        AddContractorComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'contractors', component: ContractorListComponent}
        ]),
        StoreModule.forFeature(Features.CONTRACTOR, contractorReducer),
        EffectsModule.forFeature([ContractorEffects]),
        SharedModule,
        TableModule,
        ButtonModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule
    ],
    providers: [
        {provide: ContractorRestService, useClass: ContractorRestServiceImpl}
    ]
})
export class ContractorModule {
}
