import {Component, OnInit} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {AuthorizationService} from "../authorization.service";
import {LoginCountdown} from "../login-countdown";

@Component({
    selector: 'logout',
    templateUrl: './logout.component.html',
    styleUrl: './logout.component.less',
    standalone: true,
    imports: [ButtonModule]
})
export class LogoutComponent implements OnInit {
    private readonly countdown = new LoginCountdown(() => this.login());
    readonly secondsLeft = this.countdown.secondsLeft;

    constructor(private authorizationService: AuthorizationService) {
    }

    ngOnInit(): void {
        this.countdown.start();
    }

    login(): void {
        this.countdown.stop();
        this.authorizationService.login();
    }
}
