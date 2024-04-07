import {NgModule} from "@angular/core";
import {StageRestService, StageRestServiceImpl} from "./rest/stage-rest.service";
import {StageListComponent} from "./stage-list/stage-list.component";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";

@NgModule({
    declarations: [
        StageListComponent
    ],
    imports: [
        TableModule,
        RouterLink
    ],
    exports: [
        StageListComponent
    ],
    providers: [
        {provide: StageRestService, useClass: StageRestServiceImpl}
    ]
})
export class StageModule {

}
