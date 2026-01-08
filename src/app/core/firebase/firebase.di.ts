import { InjectionToken, makeEnvironmentProviders, EnvironmentProviders, inject, NgZone, isDevMode } from '@angular/core';
import { FirebaseApp, initializeApp, FirebaseOptions } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { AppCheck, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('FIREBASE_FIRESTORE');
export const FIREBASE_ANALYTICS = new InjectionToken<Analytics>('FIREBASE_ANALYTICS');
export const FIREBASE_APP_CHECK = new InjectionToken<AppCheck>('FIREBASE_APP_CHECK');

export interface FirebaseConfig {
    firebase: FirebaseOptions;
    recaptchaSiteKey: string;
}

export function provideFirebase(config: FirebaseConfig): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: FIREBASE_APP,
            useFactory: () => {
                return initializeApp(config.firebase);
            },
        },
        {
            provide: FIREBASE_APP_CHECK,
            useFactory: () => {
                const app = inject(FIREBASE_APP);
                
                // Enable debug token for local development
                if (isDevMode() && typeof window !== 'undefined') {
                    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
                }
                
                return initializeAppCheck(app, {
                    provider: new ReCaptchaV3Provider(config.recaptchaSiteKey),
                    isTokenAutoRefreshEnabled: true
                });
            },
        },
        {
            provide: FIREBASE_AUTH,
            useFactory: () => {
                const app = inject(FIREBASE_APP);
                return getAuth(app);
            },
        },
        {
            provide: FIREBASE_FIRESTORE,
            useFactory: () => {
                const app = inject(FIREBASE_APP);
                return getFirestore(app);
            },
        },
        {
            provide: FIREBASE_ANALYTICS,
            useFactory: () => {
                const app = inject(FIREBASE_APP);
                return getAnalytics(app);
            },
        },
    ]);
}
