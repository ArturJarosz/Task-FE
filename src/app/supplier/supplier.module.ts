import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SupplierListComponent} from "./supplier-list/supplier-list.component";
import {RouterModule} from "@angular/router";
import {SupplierRestService, SupplierRestServiceImpl} from "./rest/suppplier-rest.service";
import {SharedModule} from "../shared/shared.module";
import {TableModule} from "primeng/table";
import {AddSupplierComponent} from './add-supplier/add-supplier.component';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {InputTextareaModule} from "primeng/inputtextarea";
import {SupplierDetailShellComponent} from './supplier-detail-shell/supplier-detail-shell.component';
import {SupplierDetailComponent} from './supplier-detail/supplier-detail.component';
import {AccordionModule} from "primeng/accordion";
import {SupplierListShellComponent} from './supplier-list-shell/supplier-list-shell.component';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {RippleModule} from "primeng/ripple";

@NgModule({
    declarations: [
        SupplierListComponent,
        AddSupplierComponent,
        SupplierDetailShellComponent,
        SupplierDetailComponent,
        SupplierListShellComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'suppliers', component: SupplierListShellComponent},
            {path: 'suppliers/:supplierId', component: SupplierDetailShellComponent},
        ]),
        SharedModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        InputTextareaModule,
        AccordionModule,
        ConfirmDialogModule,
        RippleModule
    ],
    providers: [
        {provide: SupplierRestService, useClass: SupplierRestServiceImpl}
    ]
})
export class SupplierModule {
}
