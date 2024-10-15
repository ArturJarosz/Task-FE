import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from "../authorization.service";

@Component({
    selector: 'app-not-logged-in',
    templateUrl: './not-logged-in.component.html',
    styleUrl: './not-logged-in.component.less'
})
export class NotLoggedInComponent implements OnInit {

    constructor(private authorizationService: AuthorizationService) {
    }

    // TODO: time should be configured from application configuration
    ngOnInit(): void {
        if (!this.authorizationService.isAuthenticated()) {
            setTimeout(() => {
                this.authorizationService.login();
            }, 3000);
        }
    }

}
