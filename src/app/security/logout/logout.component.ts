import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from "../authorization.service";

@Component({
    selector: 'logout',
    templateUrl: './logout.component.html',
    styleUrl: './logout.component.less'
})
export class LogoutComponent implements OnInit {

    constructor(private authorizationService: AuthorizationService) {
    }

    // TODO: time should be configured from application configuration
    ngOnInit(): void {
        setTimeout(() => {
            this.authorizationService.login();
        }, 3000);
    }

}
