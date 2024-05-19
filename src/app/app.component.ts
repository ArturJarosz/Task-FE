import {Component, inject, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ConfigurationStore} from "./shared/configuration/state";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    title = 'Task-FE';
    items: MenuItem[] = [];

    readonly configurationStore = inject(ConfigurationStore);

//TODO TA-313 Make many code dependent, not hardcoded in HTML
    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
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
            },
            {
                label: "Contractors",
                routerLink: "/contractors"
            }
        ]
    }
}
