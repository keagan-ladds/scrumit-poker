import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { projectConfig } from '../environments/environment.default';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withComponentInputBinding()), provideClientHydration(),
  importProvidersFrom(provideFirebaseApp(() => initializeApp(projectConfig))),
  importProvidersFrom(provideFirestore(() => getFirestore())),
  importProvidersFrom(provideAuth(() => getAuth()))]
};
