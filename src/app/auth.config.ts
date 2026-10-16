import {environment} from "../environments/environment";

export const auth_config = {
    domain: `${environment.auth.auth0.domain}`,
    clientId: `${environment.auth.auth0.clientId}`,
    authorizationParams: {
        redirect_uri: window.location.origin,
        audience: `${environment.auth.auth0.audience}`,
    },
    httpInterceptor: {
        allowedList: [`${environment.baseUrl}/*`]
    },
    // Keep the session across page reloads: the refresh token lives in localStorage and renews
    // access tokens without the hidden iframe, which browsers block when third-party cookies are off.
    // Requires Refresh Token Rotation and Offline Access enabled on the Auth0 application.
    // TODO before production: any XSS can read tokens from localStorage. Once Auth0 has a custom domain,
    // switch cacheLocation to 'memory' (the iframe fallback then works as a first-party request).
    cacheLocation: 'localstorage' as const,
    useRefreshTokens: true,
};

