import {HttpErrorResponse} from "@angular/common/http";

// Auth0 errors meaning the stored session can't be renewed and the user has to log in again
// (e.g. the refresh token expired or was revoked).
const SESSION_EXPIRED_ERRORS = ['invalid_grant', 'missing_refresh_token', 'login_required'];

export function isSessionExpiredError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
        return false;
    }
    const code = (error as { error?: unknown } | null | undefined)?.error;
    return typeof code === 'string' && SESSION_EXPIRED_ERRORS.includes(code);
}
