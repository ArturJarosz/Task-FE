import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CostListComponent} from "./cost/cost-list/cost-list.component";
import {SharedModule} from "primeng/api";
import {TableModule} from "primeng/table";

@NgModule({
    declarations: [
        CostListComponent
    ],
    exports: [
        CostListComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        TableModule
    ]
})
export class FinanceModule {
}
