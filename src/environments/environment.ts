// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  luv2shopApiUrl: "http://localhost:3000/api",
  firebase: {
    apiKey: "AIzaSyBFXPWYKi6nZGlcMSi5GIH6ltQ-FwVviFw",
    authDomain: "user-subscription-service.firebaseapp.com",
    projectId: "user-subscription-service",
    messagingSenderId: "33823052882",
    appId: "user-subscription-service",
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
