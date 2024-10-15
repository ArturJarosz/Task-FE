import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LogoutComponent} from "./logout/logout.component";
import {RouterModule} from "@angular/router";
import {NotLoggedInComponent} from './not-logged-in/not-logged-in.component';

@NgModule({
    declarations: [
        LogoutComponent,
        NotLoggedInComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'logout', component: LogoutComponent},
            {path: 'not-logged-in', component: NotLoggedInComponent},
        ]),
    ]
})
export class SecurityModule {
}
