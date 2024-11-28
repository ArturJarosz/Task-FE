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
import {loggedInGuardGuard} from "../security/logged-in-guard/logged-in-guard.guard";
import { SuppliesListComponent } from './supplies-list/supplies-list.component';
import { SuppliesListShellComponent } from './supplies-list-shell/supplies-list-shell.component';

@NgModule({
    declarations: [
        SupplierListComponent,
        AddSupplierComponent,
        SupplierDetailShellComponent,
        SupplierDetailComponent,
        SupplierListShellComponent,
        SuppliesListComponent,
        SuppliesListShellComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'suppliers', component: SupplierListShellComponent, canActivate: [loggedInGuardGuard]},
            {path: 'suppliers/:supplierId', component: SupplierDetailShellComponent, canActivate: [loggedInGuardGuard]},
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
