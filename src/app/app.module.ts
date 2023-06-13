import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {ClientModule} from './client/client.module';
import {MainComponent} from './main/main.component'
import {RouterModule} from "@angular/router";
import {MenubarModule} from "primeng/menubar";

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ClientModule,
        RouterModule.forRoot([
            {path: 'home', component: MainComponent},
            {path: '', redirectTo: 'home', pathMatch: 'full'},
            {path: '**', redirectTo: 'home', pathMatch: 'full'}
        ]),
        MenubarModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
