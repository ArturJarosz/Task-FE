import {Component, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
    title = 'Task-FE';
    items: MenuItem[] = [];

    ngOnInit(): void {
        this.items = [
            {
                label: "Main",
                routerLink: "/home"
            },
            {
                label: "Clients",
                routerLink: "/clients"
            }
        ]
    }
}
