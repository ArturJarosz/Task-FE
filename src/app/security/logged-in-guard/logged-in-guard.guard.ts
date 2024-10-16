import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {AuthorizationService} from "../authorization.service";
import {inject} from "@angular/core";

export const loggedInGuardGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authenticationService = inject(AuthorizationService);
    const router = inject(Router);

    if (!authenticationService.isAuthenticated()) {
        router.navigateByUrl('/not-logged-in');
        return false;
    }
    return true;

};
