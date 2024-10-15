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
};

