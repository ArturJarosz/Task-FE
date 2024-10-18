export const environment = {
    production: true,
    baseUrl: 'BASE_URL',
    feUrl: `http:localhost:FE_PORT`,
    auth: {
        auth0: {
            domain: 'AUTH0_DOMAIN',
            clientId: 'AUTH0_CLIENT_ID',
            audience: 'AUTH0_AUDIENCE'
        }
    }
};
