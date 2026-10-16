import {HttpErrorResponse} from '@angular/common/http';
import {isSessionExpiredError} from './session-expiry';

describe('isSessionExpiredError', () => {
    it('should recognise Auth0 errors that need a new login', () => {
        expect(isSessionExpiredError({error: 'invalid_grant', message: 'Unknown or invalid refresh token.'})).toBe(true);
        expect(isSessionExpiredError({error: 'missing_refresh_token'})).toBe(true);
        expect(isSessionExpiredError({error: 'login_required'})).toBe(true);
    });

    it('should ignore other errors', () => {
        expect(isSessionExpiredError({error: 'access_denied'})).toBe(false);
        expect(isSessionExpiredError(new Error('boom'))).toBe(false);
        expect(isSessionExpiredError(null)).toBe(false);
        expect(isSessionExpiredError(undefined)).toBe(false);
    });

    it('should ignore HTTP errors from the backend', () => {
        expect(isSessionExpiredError(new HttpErrorResponse({status: 401, error: 'invalid_grant'}))).toBe(false);
    });
});
