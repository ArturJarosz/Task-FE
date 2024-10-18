// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://0.0.0.0:8100',
  feUrl: `http:localhost:8050`,
  auth: {
    auth0: {
      domain: 'task-app-test.uk.auth0.com',
      clientId: 'VhlnmiQXvMtcqk2e3e5DxbaRv4LSQ8eh',
      audience: 'Task-Test-API'
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
