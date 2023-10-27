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

@NgModule({
    declarations: [
        ContractorListComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'contractors', component: ContractorListComponent}
        ]),
        StoreModule.forFeature(Features.CONTRACTOR, contractorReducer),
        EffectsModule.forFeature([ContractorEffects]),
        SharedModule,
        TableModule
    ],
    providers: [
        {provide: ContractorRestService, useClass: ContractorRestServiceImpl}
    ]
})
export class ContractorModule {
}
