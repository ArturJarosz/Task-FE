import {Component, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ConfigurationState, loadConfiguration} from "./shared/configuration/state";
import {Store} from "@ngrx/store";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
    title = 'Task-FE';
    items: MenuItem[] = [];

    constructor(private configurationStore: Store<ConfigurationState>) {
    }

//TODO TA-313 Make many code dependent, not hardcoded in HTML
    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.items = [
            {
                label: "Main",
                routerLink: "/home"
            },
            {
                label: "Clients",
                routerLink: "/clients"
            },
            {
                label: "Architects",
                routerLink: "/architects"
            },
            {
                label: "Projects",
                routerLink: "/projects"
            }
        ]
    }
}
