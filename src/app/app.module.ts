import {isDevMode, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {ClientModule} from './client/client.module';
import {MainComponent} from './main/main.component'
import {RouterModule} from "@angular/router";
import {MenubarModule} from "primeng/menubar";
import {StyleClassModule} from "primeng/styleclass";
import {RippleModule} from "primeng/ripple";
import {InputTextModule} from "primeng/inputtext";
import {ArchitectModule} from "./architect/architect.module";
import {SharedModule} from "./shared/shared.module";
import {ToastModule} from "primeng/toast";
import {ProjectModule} from "./project/project.module";
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {ContractorModule} from "./contractor/contractor.module";
import {SupplierModule} from "./supplier/supplier.module";
import {StageModule} from "./stage/stage.module";
import {TaskModule} from "./task/task.module";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {AuthorizationService, AuthorizationServiceImpl} from "./security/authorization.service";
import {SecurityModule} from "./security/security.module";
import {loggedInGuardGuard} from "./security/logged-in-guard/logged-in-guard.guard";

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ArchitectModule,
        ClientModule,
        ProjectModule,
        StageModule,
        TaskModule,
        ContractorModule,
        SupplierModule,
        RouterModule.forRoot([
            {path: 'home', component: MainComponent, canActivate: [loggedInGuardGuard]},
            {path: '', redirectTo: 'home', pathMatch: 'full'},
            {path: '**', redirectTo: 'home', pathMatch: 'full'}
        ]),
        MenubarModule,
        StyleClassModule,
        RippleModule,
        InputTextModule,
        SharedModule,
        ToastModule,
        StoreModule.forRoot({}, {}),
        EffectsModule.forRoot([]),
        StoreDevtoolsModule.instrument({name: "TASK app", maxAge: 25, logOnly: !isDevMode()}),
        StoreDevtoolsModule.instrument({maxAge: 25, logOnly: !isDevMode()}),
        BreadcrumbModule,
        SecurityModule
    ],
    providers: [
        {provide: AuthorizationService, useClass: AuthorizationServiceImpl}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
