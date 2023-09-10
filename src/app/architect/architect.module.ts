import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {ArchitectListComponent} from "./architect-list/architect-list.component";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {TableModule} from "primeng/table";
import {ArchitectRestService, ArchitectRestServiceImpl} from "./service/architect-rest.service";
import {SharedModule} from "../shared/shared.module";

@NgModule({
    declarations: [
        ArchitectListComponent
    ],
    imports: [
        RouterModule.forChild([
            {path: 'architects', component: ArchitectListComponent}
        ]),
        ButtonModule,
        RippleModule,
        SharedModule,
        TableModule,
    ],
    providers: [
        {provide: ArchitectRestService, useClass: ArchitectRestServiceImpl}
    ]
})
export class ArchitectModule {

}
