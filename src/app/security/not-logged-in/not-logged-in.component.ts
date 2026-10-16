import {Component, DestroyRef, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {AuthorizationService} from "../authorization.service";
import {LoginCountdown} from "../login-countdown";

@Component({
    selector: 'app-not-logged-in',
    templateUrl: './not-logged-in.component.html',
    styleUrl: './not-logged-in.component.less',
    standalone: true,
    imports: [ButtonModule]
})
export class NotLoggedInComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    // Set by the authorization service when the stored session could not be renewed
    readonly sessionExpired = inject(ActivatedRoute).snapshot.queryParamMap.get('reason') === 'expired';

    private readonly countdown = new LoginCountdown(() => this.login());
    readonly secondsLeft = this.countdown.secondsLeft;

    constructor(private authorizationService: AuthorizationService) {
    }

    ngOnInit(): void {
        this.authorizationService.isAuthenticated()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(isAuthenticated => {
                if (!isAuthenticated) {
                    this.countdown.start();
                }
            })
    }

    login(): void {
        this.countdown.stop();
        this.authorizationService.login();
    }
}
