import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {provideAuth0} from "@auth0/auth0-angular";
import {auth_config} from "./auth.config";

const routes: Routes = [];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [
        provideAuth0(auth_config)
    ]
})
export class AppRoutingModule {
}
